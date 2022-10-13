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

package com.svalyn.studio.domain.organization.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.MembershipRole;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationUpdateService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to update organizations.
 *
 * @author sbegaudeau
 */
@Service
public class OrganizationUpdateService implements IOrganizationUpdateService {

    private final IOrganizationRepository organizationRepository;

    private final IMessageService messageService;

    public OrganizationUpdateService(IOrganizationRepository organizationRepository, IMessageService messageService) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<Void> renameOrganization(String identifier, String name) {
        IResult<Void> result = null;

        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();

            var userId = UserIdProvider.get().getId();
            var optionalMembership = organization.getMemberships().stream()
                    .filter(membership -> membership.getMemberId().getId().equals(userId))
                    .filter(membership -> membership.getRole() == MembershipRole.ADMIN)
                    .findFirst();
            if (optionalMembership.isPresent()) {
                organization.updateName(name);
                this.organizationRepository.save(organization);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("organization"));
        }
        return result;
    }

    @Override
    public IResult<Void> leaveOrganization(String identifier) {
        IResult<Void> result = null;

        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();

            var userId = UserIdProvider.get().getId();
            var isMember = organization.getMemberships().stream()
                    .anyMatch(membership -> membership.getMemberId().getId().equals(userId));
            var isAdminLeaving = organization.getMemberships().stream()
                    .filter(membership -> membership.getMemberId().getId().equals(userId))
                    .findFirst()
                    .map(membership -> membership.getRole() == MembershipRole.ADMIN)
                    .orElse(Boolean.FALSE);
            var hasAdditionalAdmins = organization.getMemberships().stream()
                    .filter(membership -> !membership.getMemberId().getId().equals(userId))
                    .filter(membership -> membership.getRole() == MembershipRole.ADMIN)
                    .count() > 0;
            if (isMember && (!isAdminLeaving || hasAdditionalAdmins)) {
                organization.leave(userId);
                this.organizationRepository.save(organization);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("organization"));
        }

        return result;
    }

    @Override
    public IResult<Void> revokeMemberships(String identifier, List<UUID> membershipIds) {
        IResult<Void> result = null;
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            var usedId = UserIdProvider.get().getId();
            var isAdmin = organization.getMemberships().stream()
                    .filter(membership -> membership.getMemberId().getId().equals(usedId))
                    .anyMatch(membership -> membership.getRole() == MembershipRole.ADMIN);
            var isRemovingAnAdmin = organization.getMemberships().stream()
                    .filter(membership -> membershipIds.contains(membership.getId()))
                    .anyMatch(membership -> membership.getRole() == MembershipRole.ADMIN);
            if (isAdmin && !isRemovingAnAdmin) {
                organization.revokeMemberships(membershipIds);
                this.organizationRepository.save(organization);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("organization"));
        }
        return result;
    }

    @Override
    public IResult<Void> inviteMember(String identifier, UUID userId) {
        IResult<Void> result = null;
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            var isAdmin = organization.getMemberships().stream()
                    .filter(membership -> membership.getMemberId().getId().equals(UserIdProvider.get().getId()))
                    .anyMatch(membership -> membership.getRole() == MembershipRole.ADMIN);
            var isAlreadyMember = organization.getMemberships().stream()
                    .anyMatch(membership -> membership.getMemberId().getId().equals(userId));
            if (isAdmin && !isAlreadyMember) {
                organization.inviteMember(userId);
                this.organizationRepository.save(organization);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("organization"));
        }
        return result;
    }

    @Override
    public IResult<Void> revokeInvitation(String identifier, UUID invitationId) {
        IResult<Void> result = null;
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            var userId = UserIdProvider.get().getId();
            var isAdmin = organization.getMemberships().stream()
                    .filter(membership -> membership.getMemberId().getId().equals(userId))
                    .anyMatch(membership -> membership.getRole() == MembershipRole.ADMIN);
            if (isAdmin) {
                organization.revokeInvitation(invitationId);
                this.organizationRepository.save(organization);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("organization"));
        }
        return result;
    }

    @Override
    public IResult<Void> acceptInvitation(String identifier, UUID invitationId) {
        IResult<Void> result = null;
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            var userId = UserIdProvider.get().getId();
            var isAdmin = organization.getMemberships().stream()
                    .filter(membership -> membership.getMemberId().getId().equals(userId))
                    .anyMatch(membership -> membership.getRole() == MembershipRole.ADMIN);
            if (isAdmin) {
                organization.acceptInvitation(invitationId);
                this.organizationRepository.save(organization);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("organization"));
        }
        return result;
    }

    @Override
    public IResult<Void> declineInvitation(String identifier, UUID invitationId) {
        IResult<Void> result = null;
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            var userId = UserIdProvider.get().getId();
            var isUserInvited = organization.getInvitations().stream()
                    .filter(invitation -> invitation.getId().equals(invitationId))
                    .anyMatch(invitation -> invitation.getMemberId().getId().equals(userId));
            if (isUserInvited) {
                organization.declineInvitation(invitationId);
                this.organizationRepository.save(organization);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("organization"));
        }
        return result;
    }
}
