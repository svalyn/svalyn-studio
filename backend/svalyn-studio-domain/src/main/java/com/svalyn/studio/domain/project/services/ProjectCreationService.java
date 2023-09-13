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

package com.svalyn.studio.domain.project.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.UserIdProvider;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.MembershipRole;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationPermissionService;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import com.svalyn.studio.domain.project.services.api.IProjectCreationService;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Used to create projects.
 *
 * @author sbegaudeau
 */
@Service
public class ProjectCreationService implements IProjectCreationService {

    private final IOrganizationPermissionService organizationPermissionService;

    private final IOrganizationRepository organizationRepository;

    private final IProjectRepository projectRepository;

    private final IMessageService messageService;

    public ProjectCreationService(IOrganizationPermissionService organizationPermissionService, IOrganizationRepository organizationRepository, IProjectRepository projectRepository, IMessageService messageService) {
        this.organizationPermissionService = Objects.requireNonNull(organizationPermissionService);
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<Project> createProject(String organizationIdentifier, String identifier, String name, String description) {
        IResult<Project> result = null;

        var optionalOrganization = this.organizationRepository.findByIdentifier(organizationIdentifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();
            var userId = UserIdProvider.get().getId();

            var membershipRole = this.organizationPermissionService.role(userId, organization.getId());

            if (name.isBlank()) {
                result = new Failure<>(this.messageService.cannotBeBlank("name"));
            } else if (identifier.isBlank()) {
                result = new Failure<>(this.messageService.cannotBeBlank("identifier"));
            } else if (membershipRole == MembershipRole.NONE) {
                result = new Failure<>(this.messageService.unauthorized());
            } else {
                var project = Project.newProject()
                        .organization(AggregateReference.to(organization.getId()))
                        .identifier(identifier)
                        .name(name)
                        .description(description)
                        .readMe(this.defaultReadMe(name))
                        .build();

                this.projectRepository.save(project);
                result = new Success<>(project);
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("organization"));
        }

        return result;
    }

    private String defaultReadMe(String name) {
        var content = """
        # Getting started
        Welcome to %s! Have a look at the content available to get familiar with the project.
        
        This is the default README content. You can customize it however you like. You can edit it to include any information relevant for contributors working on this project by clicking the pencil icon in the top right corner.
        
        ## What this project is all about
        Describe the purpose and use cases of your project here.
        This is where you can tell the story of your project and all of its features...
        """;

        return String.format(content, name);
    }
}
