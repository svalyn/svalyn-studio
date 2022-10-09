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
import com.svalyn.studio.domain.message.api.IMessageService;
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
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            organization.updateName(name);

            this.organizationRepository.save(organization);

            return new Success<>(null);
        }
        return new Failure<>(this.messageService.doesNotExist("organization"));
    }

    @Override
    public IResult<Void> leaveOrganization(String identifier, UUID userId) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            organization.leave(userId);

            this.organizationRepository.save(organization);

            return new Success<>(null);
        }
        return new Failure<>(this.messageService.doesNotExist("organization"));
    }

    @Override
    public IResult<Void> revokeMemberships(String identifier, List<UUID> membershipIds) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            organization.revokeMemberships(membershipIds);

            this.organizationRepository.save(organization);

            return new Success<>(null);
        }
        return new Failure<>(this.messageService.doesNotExist("organization"));
    }

    @Override
    public IResult<Void> inviteMember(String identifier, UUID userId) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            organization.inviteMember(userId);

            this.organizationRepository.save(organization);

            return new Success<>(null);
        }
        return new Failure<>(this.messageService.doesNotExist("organization"));
    }

    @Override
    public IResult<Void> revokeInvitation(String identifier, UUID invitationId) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            organization.revokeInvitation(invitationId);

            this.organizationRepository.save(organization);

            return new Success<>(null);
        }
        return new Failure<>(this.messageService.doesNotExist("organization"));
    }

    @Override
    public IResult<Void> acceptInvitation(String identifier, UUID invitationId) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            organization.acceptInvitation(invitationId);

            this.organizationRepository.save(organization);

            return new Success<>(null);
        }
        return new Failure<>(this.messageService.doesNotExist("organization"));
    }

    @Override
    public IResult<Void> declineInvitation(String identifier, UUID invitationId) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(identifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            organization.declineInvitation(invitationId);

            this.organizationRepository.save(organization);

            return new Success<>(null);
        }
        return new Failure<>(this.messageService.doesNotExist("organization"));
    }
}
