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

package com.svalyn.studio.domain.history.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.UserIdProvider;
import com.svalyn.studio.domain.history.Change;
import com.svalyn.studio.domain.history.ChangeProposal;
import com.svalyn.studio.domain.history.ChangeResource;
import com.svalyn.studio.domain.history.repositories.IChangeProposalRepository;
import com.svalyn.studio.domain.history.repositories.IChangeRepository;
import com.svalyn.studio.domain.history.services.api.IChangeProposalCreationService;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.MembershipRole;
import com.svalyn.studio.domain.organization.services.api.IOrganizationPermissionService;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Used to create change proposal.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeProposalCreationService implements IChangeProposalCreationService {

    private final IOrganizationPermissionService organizationPermissionService;

    private final IProjectRepository projectRepository;

    private final IChangeProposalRepository changeProposalRepository;

    private final IChangeRepository changeRepository;

    private final IMessageService messageService;

    public ChangeProposalCreationService(IOrganizationPermissionService organizationPermissionService, IProjectRepository projectRepository, IChangeProposalRepository changeProposalRepository, IChangeRepository changeRepository, IMessageService messageService) {
        this.organizationPermissionService = Objects.requireNonNull(organizationPermissionService);
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.changeProposalRepository = Objects.requireNonNull(changeProposalRepository);
        this.changeRepository = Objects.requireNonNull(changeRepository);
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
    public IResult<ChangeProposal> createChangeProposal(String projectIdentifier, String name, List<UUID> resourceIds) {
        IResult<ChangeProposal> result = null;

        var optionalProject = this.projectRepository.findByIdentifier(projectIdentifier);
        if (optionalProject.isPresent()) {
            var project = optionalProject.get();
            var membershipRole = this.membershipRole(project.getId());
            if (membershipRole != MembershipRole.NONE) {
                if (name.isBlank()) {
                    result = new Failure<>(this.messageService.cannotBeBlank("name"));
                } else if (resourceIds.isEmpty()) {
                    result = new Failure<>(this.messageService.cannotBeEmpty("resources"));
                } else {
                    var changeResources = resourceIds.stream()
                            .map(resourceId -> ChangeResource.newChangeResource()
                                    .resource(AggregateReference.to(resourceId))
                                    .build())
                            .collect(Collectors.toSet());

                    var change = Change.newChange()
                            .name(name)
                            .changeResources(changeResources)
                            .build();
                    this.changeRepository.save(change);

                    var changeProposal = ChangeProposal.newChangeProposal()
                            .project(AggregateReference.to(project.getId()))
                            .name(name)
                            .readMe(this.defaultReadMe())
                            .change(AggregateReference.to(change.getId()))
                            .build();

                    this.changeProposalRepository.save(changeProposal);
                    result = new Success<>(changeProposal);
                }
            } else {
                result = new Failure<>(this.messageService.unauthorized());
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("project"));
        }

        return result;
    }



    private String defaultReadMe() {
        var content = """
        # Change proposal
        This new change proposal contain some improvements for the project.
        
        This is the default README content. You can customize it however you like. You can edit it to include any information relevant for the reviewers on the project by clicking the pencil icon in the top right corner.
        
        ## What this change proposal is all about
        Describe the purpose of this new contribution to other members of your community...
        """;

        return content;
    }
}
