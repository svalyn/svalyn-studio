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
import com.svalyn.studio.domain.organization.events.OrganizationCreatedEvent;
import com.svalyn.studio.domain.organization.events.OrganizationDeletedEvent;
import com.svalyn.studio.domain.organization.events.OrganizationModifiedEvent;
import com.svalyn.studio.domain.tag.Tag;
import com.svalyn.studio.domain.tag.repositories.ITagRepository;
import com.svalyn.studio.infrastructure.kafka.converters.api.IDomainEventToMessageConverter;
import com.svalyn.studio.infrastructure.kafka.messages.Message;
import com.svalyn.studio.infrastructure.kafka.messages.account.AccountSummaryMessage;
import com.svalyn.studio.infrastructure.kafka.messages.organization.OrganizationCreatedMessage;
import com.svalyn.studio.infrastructure.kafka.messages.organization.OrganizationDeletedMessage;
import com.svalyn.studio.infrastructure.kafka.messages.organization.OrganizationMessage;
import com.svalyn.studio.infrastructure.kafka.messages.organization.OrganizationModifiedMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Used to convert organization events.
 *
 * @author sbegaudeau
 */
@Service
public class OrganizationEventToMessageConverter implements IDomainEventToMessageConverter {

    private final IAccountRepository accountRepository;

    private final ITagRepository tagRepository;

    public OrganizationEventToMessageConverter(IAccountRepository accountRepository, ITagRepository tagRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.tagRepository = Objects.requireNonNull(tagRepository);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Message> convert(IDomainEvent event) {
        Optional<Message> optionalMessage = Optional.empty();

        if (event instanceof OrganizationCreatedEvent organizationCreatedEvent) {
            optionalMessage = this.toMessage(organizationCreatedEvent);
        } else if (event instanceof OrganizationModifiedEvent organizationModifiedEvent) {
            optionalMessage = this.toMessage(organizationModifiedEvent);
        } else if (event instanceof OrganizationDeletedEvent organizationDeletedEvent) {
            optionalMessage = this.toMessage(organizationDeletedEvent);
        }

        return optionalMessage;
    }

    private Optional<Message> toMessage(OrganizationCreatedEvent event) {
        return this.toMessage(event.organization())
                .map(organization -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        OrganizationCreatedMessage.class.getSimpleName(),
                        new OrganizationCreatedMessage(event.createdOn(), this.toSummary(event.createdBy()), organization)
                ));
    }

    private Optional<Message> toMessage(OrganizationModifiedEvent event) {
        return this.toMessage(event.organization())
                .map(organization -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        OrganizationModifiedMessage.class.getSimpleName(),
                        new OrganizationModifiedMessage(event.createdOn(), this.toSummary(event.createdBy()), organization)
                ));
    }

    private Optional<Message> toMessage(OrganizationDeletedEvent event) {
        return this.toMessage(event.organization())
                .map(organization -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        OrganizationDeletedMessage.class.getSimpleName(),
                        new OrganizationDeletedMessage(event.createdOn(), this.toSummary(event.createdBy()), organization)
                ));
    }

    private Optional<OrganizationMessage> toMessage(Organization organization) {
        var organizationTags = this.tagRepository.findAllByOrganizationId(organization.getId()).stream().collect(Collectors.toMap(Tag::getKey, Tag::getValue));
        var optionalCreatedBySummary = this.accountRepository.findById(organization.getCreatedBy().getId()).map(this::toSummary);
        var optionalLastModifiedBySummary = this.accountRepository.findById(organization.getLastModifiedBy().getId()).map(this::toSummary);

        return optionalCreatedBySummary.flatMap(createdBySummary ->
                optionalLastModifiedBySummary.map(lastModifiedBySummary ->
                        new OrganizationMessage(
                                organization.getId(),
                                organization.getIdentifier(),
                                organization.getName(),
                                organizationTags,
                                createdBySummary,
                                organization.getCreatedOn(),
                                lastModifiedBySummary,
                                organization.getLastModifiedOn()
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
}
