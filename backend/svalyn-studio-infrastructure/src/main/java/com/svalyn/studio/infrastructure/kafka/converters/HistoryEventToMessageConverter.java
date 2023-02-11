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
import com.svalyn.studio.domain.history.Change;
import com.svalyn.studio.domain.history.ChangeProposal;
import com.svalyn.studio.domain.history.ChangeResource;
import com.svalyn.studio.domain.history.Review;
import com.svalyn.studio.domain.history.events.ChangeProposalCreatedEvent;
import com.svalyn.studio.domain.history.events.ChangeProposalDeletedEvent;
import com.svalyn.studio.domain.history.events.ChangeProposalModifiedEvent;
import com.svalyn.studio.domain.history.events.ResourcesAddedToChangeEvent;
import com.svalyn.studio.domain.history.events.ResourcesRemovedFromChangeEvent;
import com.svalyn.studio.domain.history.events.ReviewModifiedEvent;
import com.svalyn.studio.domain.history.events.ReviewPerformedEvent;
import com.svalyn.studio.domain.history.repositories.IChangeRepository;
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import com.svalyn.studio.domain.tag.Tag;
import com.svalyn.studio.domain.tag.repositories.ITagRepository;
import com.svalyn.studio.infrastructure.kafka.converters.api.IDomainEventToMessageConverter;
import com.svalyn.studio.infrastructure.kafka.messages.Message;
import com.svalyn.studio.infrastructure.kafka.messages.account.AccountSummaryMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ChangeMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ChangeProposalCreatedMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ChangeProposalDeletedMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ChangeProposalMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ChangeProposalModifiedMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ChangeResourceMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ResourcesAddedToChangeMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ResourcesRemovedFromChangeMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ReviewMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ReviewModifiedMessage;
import com.svalyn.studio.infrastructure.kafka.messages.history.ReviewPerformedMessage;
import com.svalyn.studio.infrastructure.kafka.messages.organization.OrganizationSummaryMessage;
import com.svalyn.studio.infrastructure.kafka.messages.project.ProjectSummaryMessage;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Used to convert history events to messages.
 *
 * @author sbegaudeau
 */
@Service
public class HistoryEventToMessageConverter implements IDomainEventToMessageConverter {

    private final IOrganizationRepository organizationRepository;

    private final IProjectRepository projectRepository;

    private final IAccountRepository accountRepository;

    private final IResourceRepository resourceRepository;

    private final IChangeRepository changeRepository;

    private final ITagRepository tagRepository;

    public HistoryEventToMessageConverter(IOrganizationRepository organizationRepository, IProjectRepository projectRepository, IAccountRepository accountRepository, IResourceRepository resourceRepository, IChangeRepository changeRepository, ITagRepository tagRepository) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
        this.changeRepository = Objects.requireNonNull(changeRepository);
        this.tagRepository = Objects.requireNonNull(tagRepository);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Message> convert(IDomainEvent event) {
        Optional<Message> optionalMessage = Optional.empty();

        if (event instanceof ChangeProposalCreatedEvent changeProposalCreatedEvent) {
            optionalMessage = this.toMessage(changeProposalCreatedEvent);
        } else if (event instanceof ChangeProposalModifiedEvent changeProposalModifiedEvent) {
            optionalMessage = this.toMessage(changeProposalModifiedEvent);
        } else if (event instanceof ChangeProposalDeletedEvent changeProposalDeletedEvent) {
            optionalMessage = this.toMessage(changeProposalDeletedEvent);
        } else if (event instanceof ReviewPerformedEvent reviewPerformedEvent) {
            optionalMessage = this.toMessage(reviewPerformedEvent);
        } else if (event instanceof ReviewModifiedEvent reviewModifiedEvent) {
            optionalMessage = this.toMessage(reviewModifiedEvent);
        } else if (event instanceof ResourcesAddedToChangeEvent resourcesAddedToChangeEvent) {
            optionalMessage = this.toMessage(resourcesAddedToChangeEvent);
        } else if (event instanceof ResourcesRemovedFromChangeEvent resourcesRemovedFromChangeEvent) {
            optionalMessage = this.toMessage(resourcesRemovedFromChangeEvent);
        }

        return optionalMessage;
    }

    private Optional<Message> toMessage(ChangeProposalCreatedEvent event) {
        return this.toMessage(event.changeProposal())
                .map(changeProposalMessage -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ChangeProposalCreatedMessage.class.getSimpleName(),
                        new ChangeProposalCreatedMessage(event.createdOn(), this.toMessage(event.createdBy()), changeProposalMessage)
                ));
    }

    private Optional<Message> toMessage(ChangeProposalModifiedEvent event) {
        return this.toMessage(event.changeProposal())
                .map(changeProposalMessage -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ChangeProposalModifiedMessage.class.getSimpleName(),
                        new ChangeProposalModifiedMessage(event.createdOn(), this.toMessage(event.createdBy()), changeProposalMessage)
                ));
    }

    private Optional<Message> toMessage(ChangeProposalDeletedEvent event) {
        return this.toMessage(event.changeProposal())
                .map(changeProposalMessage -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ChangeProposalDeletedMessage.class.getSimpleName(),
                        new ChangeProposalDeletedMessage(event.createdOn(), this.toMessage(event.createdBy()), changeProposalMessage)
                ));
    }

    private Optional<Message> toMessage(ReviewPerformedEvent event) {
        return this.toMessage(event.changeProposal())
                .map(changeProposalMessage -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ReviewPerformedMessage.class.getSimpleName(),
                        new ReviewPerformedMessage(event.createdOn(), this.toMessage(event.createdBy()), changeProposalMessage)
                ));
    }

    private Optional<Message> toMessage(ReviewModifiedEvent event) {
        return this.toMessage(event.changeProposal())
                .map(changeProposalMessage -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ReviewModifiedMessage.class.getSimpleName(),
                        new ReviewModifiedMessage(event.createdOn(), this.toMessage(event.createdBy()), changeProposalMessage)
                ));
    }

    private Optional<Message> toMessage(ResourcesAddedToChangeEvent event) {
        return this.toMessage(event.change())
                .map(changeMessage -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ResourcesAddedToChangeMessage.class.getSimpleName(),
                        new ResourcesAddedToChangeMessage(event.createdOn(), this.toMessage(event.createdBy()), changeMessage)
                ));
    }

    private Optional<Message> toMessage(ResourcesRemovedFromChangeEvent event) {
        return this.toMessage(event.change())
                .map(changeMessage -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ResourcesRemovedFromChangeMessage.class.getSimpleName(),
                        new ResourcesRemovedFromChangeMessage(event.createdOn(), this.toMessage(event.createdBy()), changeMessage)
                ));
    }

    private Optional<ChangeProposalMessage> toMessage(ChangeProposal changeProposal) {
        var optionalCreatedBy = this.accountRepository.findById(changeProposal.getCreatedBy().getId());
        var optionalLastModifiedBy = this.accountRepository.findById(changeProposal.getLastModifiedBy().getId());
        var optionalChange = this.changeRepository.findById(changeProposal.getChange().getId());
        var optionalProject = this.projectRepository.findById(changeProposal.getProject().getId());
        var optionalOrganization = optionalProject.map(Project::getOrganization)
                .map(AggregateReference::getId)
                .flatMap(this.organizationRepository::findById);

        var optionalChangeMessage = optionalChange.flatMap(change -> this.toMessage(change));
        var optionalOrganizationSummary = optionalOrganization.map(organization -> {
            var organizationTags = this.tagRepository.findAllByOrganizationId(organization.getId()).stream()
                    .collect(Collectors.toMap(Tag::getKey, Tag::getValue));
            return this.toSummary(organization, organizationTags);
        });
        var optionalProjectSummary = optionalOrganizationSummary.flatMap(organizationSummary -> optionalProject.map(project -> {
            var projectTags = this.tagRepository.findAllByProjectId(project.getId()).stream()
                    .collect(Collectors.toMap(Tag::getKey, Tag::getValue));
            return this.toSummary(organizationSummary, project, projectTags);
        }));
        var optionalCreatedBySummary = optionalCreatedBy.map(this::toSummary);
        var optionalLastModifiedBySummary = optionalLastModifiedBy.map(this::toSummary);

        List<ReviewMessage> reviews = changeProposal.getReviews().stream()
                .flatMap(review -> this.toMessage(review).stream())
                .toList();

        return optionalOrganizationSummary.flatMap(organizationSummary ->
                optionalProjectSummary.flatMap(projectSummary ->
                        optionalCreatedBySummary.flatMap(createdBySummary ->
                                optionalLastModifiedBySummary.flatMap(lastModifiedBySummary ->
                                        optionalChangeMessage.map(change ->
                                                new ChangeProposalMessage(
                                                        changeProposal.getId(),
                                                        changeProposal.getName(),
                                                        changeProposal.getReadMe(),
                                                        projectSummary,
                                                        change,
                                                        reviews,
                                                        changeProposal.getStatus(),
                                                        createdBySummary,
                                                        changeProposal.getCreatedOn(),
                                                        lastModifiedBySummary,
                                                        changeProposal.getLastModifiedOn()
                                                )
                                        )
                                )
                        )
                )
        );
    }

    private Optional<ChangeMessage> toMessage(Change change) {
        List<ChangeResourceMessage> changeResources = change.getChangeResources().stream()
                .flatMap(resource -> this.toMessage(resource).stream())
                .toList();
        return Optional.of(new ChangeMessage(change.getId(), change.getName(), changeResources));
    }

    private Optional<ChangeResourceMessage> toMessage(ChangeResource changeResource) {
        var optionalResource = this.resourceRepository.findById(changeResource.getResource().getId());
        return optionalResource.map(resource -> new ChangeResourceMessage(changeResource.getId(), changeResource.getResource().getId(), resource.getName()));
    }

    private Optional<ReviewMessage> toMessage(Review review) {
        var optionalCreatedBySummary = this.accountRepository.findById(review.getCreatedBy().getId()).map(this::toSummary);
        var optionalLastModifiedBySummary = this.accountRepository.findById(review.getLastModifiedBy().getId()).map(this::toSummary);

        return optionalCreatedBySummary.flatMap(createdBySummary ->
                optionalLastModifiedBySummary.map(lastModifiedBySummary ->
                        new ReviewMessage(
                                review.getId(),
                                review.getMessage(),
                                review.getStatus(),
                                createdBySummary,
                                review.getCreatedOn(),
                                lastModifiedBySummary,
                                review.getLastModifiedOn()
                        )
                )
        );
    }

    private AccountSummaryMessage toSummary(Account account) {
        return new AccountSummaryMessage(account.getId(), account.getName(), account.getUsername());
    }

    private AccountSummaryMessage toMessage(Profile profile) {
        return new AccountSummaryMessage(profile.id(), profile.name(), profile.username());
    }

    private OrganizationSummaryMessage toSummary(Organization organization, Map<String, String> tags) {
        return new OrganizationSummaryMessage(organization.getId(), organization.getIdentifier(), organization.getName(), tags);
    }

    private ProjectSummaryMessage toSummary(OrganizationSummaryMessage organization, Project project, Map<String, String> tags) {
        return new ProjectSummaryMessage(project.getId(), project.getIdentifier(), project.getName(), tags, organization);
    }
}
