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
import com.svalyn.studio.application.controllers.dto.SuccessPayload;
import com.svalyn.studio.application.controllers.organization.dto.CreateOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.CreateOrganizationSuccessPayload;
import com.svalyn.studio.application.controllers.organization.dto.DeleteOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.LeaveOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.UpdateOrganizationNameInput;
import com.svalyn.studio.application.services.organization.api.IOrganizationService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationCreationService;
import com.svalyn.studio.domain.organization.services.api.IOrganizationDeletionService;
import com.svalyn.studio.domain.organization.services.api.IOrganizationPermissionService;
import com.svalyn.studio.domain.organization.services.api.IOrganizationUpdateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to manipulate organizations.
 *
 * @author sbegaudeau
 */
@Service
public class OrganizationService implements IOrganizationService {

    private final IAccountRepository accountRepository;

    private final IOrganizationRepository organizationRepository;

    private final IOrganizationCreationService organizationCreationService;

    private final IOrganizationUpdateService organizationUpdateService;

    private final IOrganizationDeletionService organizationDeletionService;

    private final IOrganizationPermissionService organizationPermissionService;

    public OrganizationService(IAccountRepository accountRepository, IOrganizationRepository organizationRepository, IOrganizationCreationService organizationCreationService, IOrganizationUpdateService organizationUpdateService, IOrganizationDeletionService organizationDeletionService, IOrganizationPermissionService organizationPermissionService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.organizationCreationService = Objects.requireNonNull(organizationCreationService);
        this.organizationUpdateService = Objects.requireNonNull(organizationUpdateService);
        this.organizationDeletionService = Objects.requireNonNull(organizationDeletionService);
        this.organizationPermissionService = Objects.requireNonNull(organizationPermissionService);
    }

    private Optional<OrganizationDTO> toDTO(Organization organization) {
        var optionalCreatedByProfile = this.accountRepository.findById(organization.getCreatedBy().getId())
                .map(account -> new Profile(account.getName(), account.getImageUrl()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(organization.getLastModifiedBy().getId())
                .map(account -> new Profile(account.getName(), account.getImageUrl()));

        var userId = UserIdProvider.get().getId();
        return optionalCreatedByProfile.flatMap(createdBy ->
                optionalLastModifiedByProfile.map(lastModifiedBy ->
                        new OrganizationDTO(
                                organization.getId(),
                                organization.getIdentifier(),
                                organization.getName(),
                                this.organizationPermissionService.role(userId, organization),
                                organization.getCreatedOn(),
                                createdBy,
                                organization.getLastModifiedOn(),
                                lastModifiedBy
                        )
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrganizationDTO> findAll() {
        var pageable = PageRequest.of(0, 20);
        var organizationDTOs = this.organizationRepository.findAll(pageable).stream().flatMap(organization -> this.toDTO(organization).stream()).toList();
        return new PageImpl<>(organizationDTOs, pageable, organizationDTOs.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrganizationDTO> findById(UUID id) {
        var userId = UserIdProvider.get().getId();
        return this.organizationRepository.findById(id).flatMap(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrganizationDTO> findByIdentifier(String identifier) {
        var userId = UserIdProvider.get().getId();
        return this.organizationRepository.findByIdentifier(identifier).flatMap(this::toDTO);
    }

    @Override
    @Transactional
    public IPayload createOrganization(CreateOrganizationInput input) {
        IPayload payload = null;

        var result = this.organizationCreationService.createOrganization(input.identifier(), input.name());
        if (result instanceof Failure<Organization> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Organization> success) {
            var userId = UserIdProvider.get().getId();
            payload = new CreateOrganizationSuccessPayload(input.id(), this.toDTO(success.data()).orElse(null));
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload updateOrganizationName(UpdateOrganizationNameInput input) {
        IPayload payload = null;

        var result = this.organizationUpdateService.renameOrganization(input.organizationIdentifier(), input.name());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload leaveOrganization(LeaveOrganizationInput input) {
        IPayload payload = null;

        var result = this.organizationUpdateService.leaveOrganization(input.organizationIdentifier());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload deleteOrganization(DeleteOrganizationInput input) {
        IPayload payload = null;

        var result = this.organizationDeletionService.deleteOrganization(input.organizationIdentifier());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }
}
