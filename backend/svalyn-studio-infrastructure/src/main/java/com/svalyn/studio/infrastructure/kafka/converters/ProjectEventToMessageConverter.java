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

package com.svalyn.studio.infrastructure.kafka.converters;

import com.svalyn.studio.domain.IDomainEvent;
import com.svalyn.studio.domain.Profile;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.events.ProjectCreatedEvent;
import com.svalyn.studio.domain.project.events.ProjectDeletedEvent;
import com.svalyn.studio.domain.project.events.ProjectModifiedEvent;
import com.svalyn.studio.domain.tag.Tag;
import com.svalyn.studio.domain.tag.repositories.ITagRepository;
import com.svalyn.studio.infrastructure.kafka.converters.api.IDomainEventToMessageConverter;
import com.svalyn.studio.message.Message;
import com.svalyn.studio.message.account.AccountSummaryMessage;
import com.svalyn.studio.message.organization.OrganizationSummaryMessage;
import com.svalyn.studio.message.project.ProjectCreatedMessage;
import com.svalyn.studio.message.project.ProjectDeletedMessage;
import com.svalyn.studio.message.project.ProjectMessage;
import com.svalyn.studio.message.project.ProjectModifiedMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Used to convert project events.
 *
 * @author sbegaudeau
 */
@Service
public class ProjectEventToMessageConverter implements IDomainEventToMessageConverter {

    private final IOrganizationRepository organizationRepository;

    private final ITagRepository tagRepository;

    private final IAccountRepository accountRepository;

    public ProjectEventToMessageConverter(IOrganizationRepository organizationRepository, ITagRepository tagRepository, IAccountRepository accountRepository) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.tagRepository = Objects.requireNonNull(tagRepository);
        this.accountRepository = Objects.requireNonNull(accountRepository);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Message> convert(IDomainEvent event) {
        return switch (event) {
            case ProjectCreatedEvent projectCreatedEvent -> this.toMessage(projectCreatedEvent);
            case ProjectModifiedEvent projectModifiedEvent -> this.toMessage(projectModifiedEvent);
            case ProjectDeletedEvent projectDeletedEvent -> this.toMessage(projectDeletedEvent);
            default -> Optional.empty();
        };
    }

    private Optional<Message> toMessage(ProjectCreatedEvent event) {
        return this.toMessage(event.project())
                .map(project -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ProjectCreatedMessage.class.getSimpleName(),
                        new ProjectCreatedMessage(event.createdOn(), this.toSummary(event.createdBy()), project)
                ));
    }

    private Optional<Message> toMessage(ProjectModifiedEvent event) {
        return this.toMessage(event.project())
                .map(project -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ProjectModifiedMessage.class.getSimpleName(),
                        new ProjectModifiedMessage(event.createdOn(), this.toSummary(event.createdBy()), project)
                ));
    }

    private Optional<Message> toMessage(ProjectDeletedEvent event) {
        return this.toMessage(event.project())
                .map(project -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ProjectDeletedMessage.class.getSimpleName(),
                        new ProjectDeletedMessage(event.createdOn(), this.toSummary(event.createdBy()), project)
                ));
    }

    private Optional<ProjectMessage> toMessage(Project project) {
        var projectTags = this.tagRepository.findAllByProjectId(project.getId()).stream().collect(Collectors.toMap(Tag::getKey, Tag::getValue));
        var optionalCreatedBySummary = this.accountRepository.findById(project.getCreatedBy().getId()).map(this::toSummary);
        var optionalLastModifiedBySummary = this.accountRepository.findById(project.getLastModifiedBy().getId()).map(this::toSummary);

        var organizationId = project.getOrganization().getId();
        var organizationTags = this.tagRepository.findAllByOrganizationId(organizationId).stream().collect(Collectors.toMap(Tag::getKey, Tag::getValue));
        var optionalOrganizationSummary = this.organizationRepository.findById(organizationId).map(organization -> this.toSummary(organization, organizationTags));

        return optionalCreatedBySummary.flatMap(createdBySummary ->
                optionalLastModifiedBySummary.flatMap(lastModifiedBySummary ->
                        optionalOrganizationSummary.map(organizationSummary ->
                                new ProjectMessage(
                                        project.getId(),
                                        project.getIdentifier(),
                                        project.getName(),
                                        project.getDescription(),
                                        project.getReadMe(),
                                        projectTags,
                                        organizationSummary,
                                        createdBySummary,
                                        project.getCreatedOn(),
                                        lastModifiedBySummary,
                                        project.getLastModifiedOn()
                                )
                        )
                )
        );
    }

    private AccountSummaryMessage toSummary(Account account) {
        return new AccountSummaryMessage(account.getId(), account.getName(), account.getUsername());
    }

    private AccountSummaryMessage toSummary(Profile profile) {
        return new AccountSummaryMessage(profile.id(), profile.name(), profile.username());
    }

    private OrganizationSummaryMessage toSummary(Organization organization, Map<String, String> tags) {
        return new OrganizationSummaryMessage(organization.getId(), organization.getIdentifier(), organization.getName(), tags);
    }
}
