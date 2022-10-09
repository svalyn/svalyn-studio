/*
 * Copyright (c) 2022 Stéphane Bégaudeau.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.svalyn.studio.application.services.organization;

import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.Profile;
import com.svalyn.studio.application.controllers.organization.dto.AcceptInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.AcceptInvitationSuccessPayload;
import com.svalyn.studio.application.controllers.organization.dto.DeclineInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.DeclineInvitationSuccessPayload;
import com.svalyn.studio.application.controllers.organization.dto.InvitationDTO;
import com.svalyn.studio.application.controllers.organization.dto.InviteMemberInput;
import com.svalyn.studio.application.controllers.organization.dto.InviteMemberSuccessPayload;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.RevokeInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.RevokeInvitationSuccessPayload;
import com.svalyn.studio.application.services.organization.api.IInvitationService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.Invitation;
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationUpdateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * Used to manipulate invitations.
 *
 * @author sbegaudeau
 */
@Service
@Transactional(readOnly = true)
public class InvitationService implements IInvitationService {

    private final IOrganizationRepository organizationRepository;

    private final IOrganizationUpdateService organizationUpdateService;

    private final IAccountRepository accountRepository;

    private final IMessageService messageService;

    public InvitationService(IOrganizationRepository organizationRepository, IOrganizationUpdateService organizationUpdateService, IAccountRepository accountRepository, IMessageService messageService) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.organizationUpdateService = Objects.requireNonNull(organizationUpdateService);
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvitationDTO> findAll(Pageable pageable) {
        var userId = UserIdProvider.get().getId();
        var optionalAccount = this.accountRepository.findById(userId);
        return optionalAccount.map(account -> {
            var organizations = this.organizationRepository.findAllWhereInvited(userId, pageable.getOffset(), pageable.getPageSize());
            var invitations = organizations.stream()
                    .flatMap(organization -> organization.getInvitations().stream()
                            .filter(invitation -> invitation.getMemberId().getId().equals(userId))
                            .map(invitation -> new InvitationDTO(invitation.getId(), organization.getIdentifier(), new Profile(account.getName(), account.getImageUrl()))))
                    .toList();
            return new PageImpl<>(invitations);
        }).orElse(new PageImpl<>(List.of()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvitationDTO> findAll(OrganizationDTO organization, Pageable pageable) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(organization.identifier());
        var invitations = optionalOrganization.map(Organization::getInvitations).orElse(Set.of());
        var sortedInvitations = invitations.stream()
                .sorted(Comparator.comparing(Invitation::getCreatedOn))
                .flatMap(invitation -> this.accountRepository.findById(invitation.getMemberId().getId())
                        .map(account -> new InvitationDTO(invitation.getId(), organization.identifier(), new Profile(account.getName(), account.getImageUrl())))
                        .stream())
                .toList();
        return new PageImpl<>(sortedInvitations);
    }

    @Override
    @Transactional
    public IPayload inviteMember(InviteMemberInput input) {
        IPayload payload = null;

        var optionalAccount = this.accountRepository.findByEmail(input.email());
        if (optionalAccount.isPresent()) {
            var account = optionalAccount.get();
            var result = this.organizationUpdateService.inviteMember(input.organizationIdentifier(), account.getId());
            if (result instanceof Success<Void> success) {
                payload = new InviteMemberSuccessPayload(UUID.randomUUID());
            } else if (result instanceof Failure<Void> failure) {
                payload = new ErrorPayload(failure.message());
            }
        } else {
            payload = new ErrorPayload(this.messageService.doesNotExist("account"));
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload revokeInvitation(RevokeInvitationInput input) {
        IPayload payload = null;

        var result = this.organizationUpdateService.revokeInvitation(input.organizationIdentifier(), input.invitationId());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new RevokeInvitationSuccessPayload(UUID.randomUUID());
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload acceptInvitation(AcceptInvitationInput input) {
        IPayload payload = null;

        var result = this.organizationUpdateService.acceptInvitation(input.organizationIdentifier(), input.invitationId());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new AcceptInvitationSuccessPayload(UUID.randomUUID());
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload declineInvitation(DeclineInvitationInput input) {
        IPayload payload = null;

        var result = this.organizationUpdateService.declineInvitation(input.organizationIdentifier(), input.invitationId());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new DeclineInvitationSuccessPayload(UUID.randomUUID());
        }

        return payload;
    }
}
