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
import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.controllers.dto.SuccessPayload;
import com.svalyn.studio.application.controllers.organization.dto.AcceptInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.DeclineInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.InvitationDTO;
import com.svalyn.studio.application.controllers.organization.dto.InviteMemberInput;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.RevokeInvitationInput;
import com.svalyn.studio.application.services.account.api.IAvatarUrlService;
import com.svalyn.studio.application.services.organization.api.IInvitationService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.account.UserIdProvider;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.Invitation;
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationUpdateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Used to manipulate invitations.
 *
 * @author sbegaudeau
 */
@Service
public class InvitationService implements IInvitationService {

    private final IAccountRepository accountRepository;

    private final IOrganizationRepository organizationRepository;

    private final IOrganizationUpdateService organizationUpdateService;

    private final IAvatarUrlService avatarUrlService;

    private final IMessageService messageService;

    public InvitationService(IAccountRepository accountRepository, IOrganizationRepository organizationRepository, IOrganizationUpdateService organizationUpdateService, IAvatarUrlService avatarUrlService, IMessageService messageService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.organizationUpdateService = Objects.requireNonNull(organizationUpdateService);
        this.avatarUrlService = Objects.requireNonNull(avatarUrlService);
        this.messageService = Objects.requireNonNull(messageService);
    }

    private Optional<InvitationDTO> toDTO(Invitation invitation, UUID organizationId) {
        var optionalCreatedByProfile = this.accountRepository.findById(invitation.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(invitation.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));
        var optionalMemberProfile = this.accountRepository.findById(invitation.getMemberId().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));

        return optionalMemberProfile.flatMap(member ->
                optionalCreatedByProfile.flatMap(createdBy ->
                        optionalLastModifiedByProfile.map(lastModifiedBy ->
                                new InvitationDTO(invitation.getId(), organizationId, member, invitation.getCreatedOn(), createdBy, invitation.getLastModifiedOn(), lastModifiedBy)
                        )
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvitationDTO> findAll(int page, int rowsPerPage) {
        var userId = UserIdProvider.get().getId();
        var organizations = this.organizationRepository.findAllWhereInvited(userId, page, rowsPerPage);
        var organizationsCount = this.organizationRepository.countAllWhereInvited(userId, page, rowsPerPage);
        var invitations = organizations.stream()
                .flatMap(organization -> organization.getInvitations().stream()
                        .filter(invitation -> invitation.getMemberId().getId().equals(userId))
                        .flatMap(invitation -> this.toDTO(invitation, organization.getId()).stream()))
                .toList();
        return new PageImpl<>(invitations, PageRequest.of(page, rowsPerPage), organizationsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvitationDTO> findAll(OrganizationDTO organization, int page, int rowsPerPage) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(organization.identifier());
        var invitations = optionalOrganization.map(Organization::getInvitations).orElse(Set.of());
        var sortedInvitations = invitations.stream()
                .sorted(Comparator.comparing(Invitation::getCreatedOn))
                .flatMap(invitation -> this.toDTO(invitation, organization.id()).stream())
                .toList();

        var fromIndex = Math.min(page * rowsPerPage, sortedInvitations.size());
        var toIndex = Math.min(fromIndex + rowsPerPage, sortedInvitations.size());
        var subList = sortedInvitations.subList(fromIndex, toIndex);
        return new PageImpl<>(subList, PageRequest.of(page, rowsPerPage), sortedInvitations.size());
    }

    @Override
    @Transactional
    public IPayload inviteMember(InviteMemberInput input) {
        return this.accountRepository.findByEmail(input.email()).map(account -> {
            var result = this.organizationUpdateService.inviteMember(input.organizationIdentifier(), account.getId());
            return switch (result) {
                case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
                case Success<Void> success -> new SuccessPayload(input.id());
            };
        }).orElse(new ErrorPayload(input.id(), this.messageService.doesNotExist("account")));
    }

    @Override
    @Transactional
    public IPayload revokeInvitation(RevokeInvitationInput input) {
        var result = this.organizationUpdateService.revokeInvitation(input.organizationIdentifier(), input.invitationId());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload acceptInvitation(AcceptInvitationInput input) {
        var result = this.organizationUpdateService.acceptInvitation(input.organizationIdentifier(), input.invitationId());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload declineInvitation(DeclineInvitationInput input) {
        var result = this.organizationUpdateService.declineInvitation(input.organizationIdentifier(), input.invitationId());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }
}
