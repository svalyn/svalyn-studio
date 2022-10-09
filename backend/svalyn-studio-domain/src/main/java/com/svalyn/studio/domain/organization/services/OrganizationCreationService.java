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
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationCreationService;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * Used to create organizations.
 *
 * @author sbegaudeau
 */
@Service
public class OrganizationCreationService implements IOrganizationCreationService {

    private final IOrganizationRepository organizationRepository;

    private final IMessageService messageService;

    public OrganizationCreationService(IOrganizationRepository organizationRepository, IMessageService messageService) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<Organization> createOrganization(String identifier, String name) {
        IResult<Organization> result = null;

        if (name.isBlank()) {
            result = new Failure<>(this.messageService.cannotBeBlank("name"));
        } else if (identifier.isBlank()) {
            result = new Failure<>(this.messageService.cannotBeBlank("identifier"));
        } else if (this.organizationRepository.existsByIdentifier(identifier)) {
            result = new Failure<>(this.messageService.alreadyExists("organization"));
        } else {
            var userId = UserIdProvider.get().getId();
            var organization = Organization.newOrganization()
                    .identifier(identifier)
                    .name(name)
                    .initialMembers(List.of(AggregateReference.to(userId)))
                    .build();

            this.organizationRepository.save(organization);

            result = new Success<>(organization);
        }

        return result;
    }
}
