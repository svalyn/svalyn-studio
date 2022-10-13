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
import com.svalyn.studio.domain.organization.services.api.IOrganizationDeletionService;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Used to delete organizations.
 *
 * @author sbegaudeau
 */
@Service
public class OrganizationDeletionService implements IOrganizationDeletionService {

    private final IOrganizationRepository organizationRepository;

    private final IMessageService messageService;

    public OrganizationDeletionService(IOrganizationRepository organizationRepository, IMessageService messageService) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<Void> deleteOrganization(String identifier) {
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
                organization.dispose();
                this.organizationRepository.delete(organization);
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
