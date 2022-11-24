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

package com.svalyn.studio.domain.changeproposal.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.changeproposal.ChangeProposal;
import com.svalyn.studio.domain.changeproposal.ChangeProposalResource;
import com.svalyn.studio.domain.changeproposal.ChangeProposalStatus;
import com.svalyn.studio.domain.changeproposal.ReviewStatus;
import com.svalyn.studio.domain.changeproposal.repositories.IChangeProposalRepository;
import com.svalyn.studio.domain.changeproposal.services.api.IChangeProposalUpdateService;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.MembershipRole;
import com.svalyn.studio.domain.organization.services.api.IOrganizationPermissionService;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Used to manipulate change proposals.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeProposalUpdateService implements IChangeProposalUpdateService {

    private final IOrganizationPermissionService organizationPermissionService;

    private final IProjectRepository projectRepository;

    private final IResourceRepository resourceRepository;

    private final IChangeProposalRepository changeProposalRepository;

    private final IMessageService messageService;

    public ChangeProposalUpdateService(IOrganizationPermissionService organizationPermissionService, IProjectRepository projectRepository, IResourceRepository resourceRepository, IChangeProposalRepository changeProposalRepository, IMessageService messageService) {
        this.organizationPermissionService = Objects.requireNonNull(organizationPermissionService);
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
        this.changeProposalRepository = Objects.requireNonNull(changeProposalRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    private MembershipRole membershipRole(UUID projectId) {
        var userId = UserIdProvider.get().getId();

        return this.projectRepository.findById(projectId)
                .map(Project::getOrganization)
                .map(AggregateReference::getId)
                .map(organizationId -> this.organizationPermissionService.role(userId, organizationId))
                .orElse(MembershipRole.NONE);
    }

    @Override
    public IResult<Void> updateReadMe(UUID changeProposalId, String content) {
        IResult<Void> result = null;

        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        if (optionalChangeProposal.isPresent()) {
            var changeProposal = optionalChangeProposal.get();

            var membershipRole = this.membershipRole(changeProposal.getProject().getId());
            if (membershipRole != MembershipRole.NONE) {
                changeProposal.updateReadMe(content);
                this.changeProposalRepository.save(changeProposal);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("change proposal"));
        }

        return result;
    }

    @Override
    public IResult<Void> updateStatus(UUID changeProposalId, ChangeProposalStatus status) {
        IResult<Void> result = null;

        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        if (optionalChangeProposal.isPresent()) {
            var changeProposal = optionalChangeProposal.get();

            var membershipRole = this.membershipRole(changeProposal.getProject().getId());
            if (membershipRole != MembershipRole.NONE) {
                if (changeProposal.getStatus() != status) {
                    changeProposal.updateStatus(status);
                    this.changeProposalRepository.save(changeProposal);

                    result = new Success<>(null);
                } else {
                    result = new Failure<>(this.messageService.invalid());
                }
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("change proposal"));
        }

        return result;
    }

    @Override
    public IResult<Void> addResources(UUID changeProposalId, List<UUID> resourceIds) {
        IResult<Void> result = null;

        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        var optionalProject = optionalChangeProposal.map(ChangeProposal::getProject)
                .map(AggregateReference::getId)
                .flatMap(this.projectRepository::findById);

        var resourcesExist = resourceIds.stream().allMatch(this.resourceRepository::existsById);

        if (!resourcesExist) {
            result = new Failure<>(this.messageService.doesNotExist("resource"));
        } else if (optionalChangeProposal.isEmpty()) {
            result = new Failure<>(this.messageService.doesNotExist("change proposal"));
        } else if (optionalProject.isEmpty()) {
            result = new Failure<>(this.messageService.doesNotExist("project"));
        } else {
            var changeProposal = optionalChangeProposal.get();
            var membershipRole = this.membershipRole(changeProposal.getProject().getId());
            if (membershipRole == MembershipRole.NONE) {
                result = new Failure<>(this.messageService.unauthorized());
            } else {
                var resourceAlreadyInChangeProposal = changeProposal.getChangeProposalResources().stream()
                        .map(ChangeProposalResource::getResource)
                        .map(AggregateReference::getId)
                        .anyMatch(resourceIds::contains);
                if (resourceAlreadyInChangeProposal) {
                    result = new Failure<>(this.messageService.alreadyExists("resource"));
                } else {
                    var changeProposalResources = resourceIds.stream()
                            .map(resourceId -> ChangeProposalResource.newChangeProposalResource()
                                    .resource(AggregateReference.to(resourceId))
                                    .build())
                            .collect(Collectors.toList());
                    changeProposal.addChangeProposalResources(changeProposalResources);
                    this.changeProposalRepository.save(changeProposal);

                    result = new Success<>(null);
                }
            }
        }

        return result;
    }

    @Override
    public IResult<Void> removeResources(UUID changeProposalId, List<UUID> changeProposalResourceIds) {
        IResult<Void> result = null;

        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        var optionalProject = optionalChangeProposal.map(ChangeProposal::getProject)
                .map(AggregateReference::getId)
                .flatMap(this.projectRepository::findById);

        if (optionalChangeProposal.isEmpty()) {
            result = new Failure<>(this.messageService.doesNotExist("change proposal"));
        } else if (optionalProject.isEmpty()) {
            result = new Failure<>(this.messageService.doesNotExist("project"));
        } else {
            var changeProposal = optionalChangeProposal.get();
            var membershipRole = this.membershipRole(changeProposal.getProject().getId());
            if (membershipRole == MembershipRole.NONE) {
                result = new Failure<>(this.messageService.unauthorized());
            } else {
                var resourcesToDelete = changeProposal.getChangeProposalResources().stream()
                        .filter(changeProposalResource -> changeProposalResourceIds.contains(changeProposalResource.getId()))
                        .toList();
                if (resourcesToDelete.size() != changeProposalResourceIds.size()) {
                    result = new Failure<>(this.messageService.doesNotExist("resource"));
                } else {
                    changeProposal.removeChangeProposalResources(resourcesToDelete);
                    this.changeProposalRepository.save(changeProposal);

                    result = new Success<>(null);
                }
            }
        }

        return result;
    }

    @Override
    public IResult<Void> performReview(UUID changeProposalId, String message, ReviewStatus status) {
        IResult<Void> result = null;

        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        if (optionalChangeProposal.isPresent()) {
            var changeProposal = optionalChangeProposal.get();

            var membershipRole = this.membershipRole(changeProposal.getProject().getId());
            if (membershipRole != MembershipRole.NONE) {
                changeProposal.performReview(message, status);
                this.changeProposalRepository.save(changeProposal);
                result = new Success<>(null);
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("change proposal"));
        }

        return result;
    }
}
