/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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

package com.svalyn.studio.domain.tag.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.MembershipRole;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationPermissionService;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import com.svalyn.studio.domain.tag.OrganizationTag;
import com.svalyn.studio.domain.tag.ProjectTag;
import com.svalyn.studio.domain.tag.Tag;
import com.svalyn.studio.domain.tag.repositories.IOrganizationTagRepository;
import com.svalyn.studio.domain.tag.repositories.IProjectTagRepository;
import com.svalyn.studio.domain.tag.repositories.ITagRepository;
import com.svalyn.studio.domain.tag.services.api.ITagCreationService;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Used to create tags.
 *
 * @author sbegaudeau
 */
@Service
public class TagCreationService implements ITagCreationService {

    private final IOrganizationPermissionService organizationPermissionService;

    private final IOrganizationRepository organizationRepository;

    private final IProjectRepository projectRepository;

    private final ITagRepository tagRepository;

    private final IOrganizationTagRepository organizationTagRepository;

    private final IProjectTagRepository projectTagRepository;

    private final IMessageService messageService;

    public TagCreationService(IOrganizationPermissionService organizationPermissionService, IOrganizationRepository organizationRepository, IProjectRepository projectRepository, ITagRepository tagRepository, IOrganizationTagRepository organizationTagRepository, IProjectTagRepository projectTagRepository, IMessageService messageService) {
        this.organizationPermissionService = Objects.requireNonNull(organizationPermissionService);
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.tagRepository = Objects.requireNonNull(tagRepository);
        this.organizationTagRepository = Objects.requireNonNull(organizationTagRepository);
        this.projectTagRepository = Objects.requireNonNull(projectTagRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<Tag> addOrganizationTag(String organizationIdentifier, String key, String value) {
        IResult<Tag> result = null;

        var optionalOrganization = this.organizationRepository.findByIdentifier(organizationIdentifier);
        if (optionalOrganization.isPresent()) {
            var organization = optionalOrganization.get();

            var userId = UserIdProvider.get().getId();
            var role = this.organizationPermissionService.role(userId, organization.getId());
            var alreadyExists = this.organizationTagRepository.existsByKeyAndValue(organization.getId(), key, value);

            if (role == MembershipRole.NONE) {
                result = new Failure<>(this.messageService.unauthorized());
            } else if (alreadyExists) {
                result = new Failure<>(this.messageService.alreadyExists("tag"));
            } else if (key.isBlank()) {
                result = new Failure<>(this.messageService.cannotBeBlank("key"));
            } else if (value.isBlank()) {
                result = new Failure<>(this.messageService.cannotBeBlank("value"));
            } else {
                var tag = this.tagRepository.findByKeyAndValue(key, value)
                        .orElseGet(() -> {
                            var newTag = Tag.newTag()
                                    .key(key)
                                    .value(value)
                                    .build();
                            return this.tagRepository.save(newTag);
                        });

                var organizationTag = OrganizationTag.newOrganizationTag()
                        .organization(AggregateReference.to(organization.getId()))
                        .tag(AggregateReference.to(tag.getId()))
                        .build();
                this.organizationTagRepository.save(organizationTag);
                result = new Success<>(tag);
            }
        } else {
            result = new Failure<>(this.messageService.alreadyExists("organization"));
        }

        return result;
    }

    @Override
    public IResult<Tag> addProjectTag(String projectIdentifier, String key, String value) {
        IResult<Tag> result = null;

        var optionalProject = this.projectRepository.findByIdentifier(projectIdentifier);
        if (optionalProject.isPresent()) {
            var project = optionalProject.get();

            var userId = UserIdProvider.get().getId();
            var role = this.organizationPermissionService.role(userId, project.getOrganization().getId());
            var alreadyExists = this.projectTagRepository.existsByKeyAndValue(project.getId(), key, value);

            if (role == MembershipRole.NONE) {
                result = new Failure<>(this.messageService.unauthorized());
            } else if (alreadyExists) {
                result = new Failure<>(this.messageService.alreadyExists("tag"));
            } else if (key.isBlank()) {
                result = new Failure<>(this.messageService.cannotBeBlank("key"));
            } else if (value.isBlank()) {
                result = new Failure<>(this.messageService.cannotBeBlank("value"));
            } else {
                var tag = this.tagRepository.findByKeyAndValue(key, value)
                        .orElseGet(() -> {
                            var newTag = Tag.newTag()
                                    .key(key)
                                    .value(value)
                                    .build();
                            return this.tagRepository.save(newTag);
                        });

                var projectTag = ProjectTag.newProjectTag()
                        .organization(AggregateReference.to(project.getId()))
                        .tag(AggregateReference.to(tag.getId()))
                        .build();
                this.projectTagRepository.save(projectTag);
                result = new Success<>(tag);
            }
        } else {
            result = new Failure<>(this.messageService.alreadyExists("project"));
        }

        return result;
    }
}
