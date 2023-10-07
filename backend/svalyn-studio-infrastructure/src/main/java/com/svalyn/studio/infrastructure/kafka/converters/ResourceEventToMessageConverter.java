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
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.events.ResourceCreatedEvent;
import com.svalyn.studio.domain.resource.events.ResourceDeletedEvent;
import com.svalyn.studio.infrastructure.kafka.converters.api.IDomainEventToMessageConverter;
import com.svalyn.studio.message.Message;
import com.svalyn.studio.message.account.AccountSummaryMessage;
import com.svalyn.studio.message.resource.ResourceCreatedMessage;
import com.svalyn.studio.message.resource.ResourceDeletedMessage;
import com.svalyn.studio.message.resource.ResourceMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to convert resource events.
 *
 * @author sbegaudeau
 */
@Service
public class ResourceEventToMessageConverter implements IDomainEventToMessageConverter {

    private final IAccountRepository accountRepository;

    public ResourceEventToMessageConverter(IAccountRepository accountRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Message> convert(IDomainEvent event) {
        return switch (event) {
            case ResourceCreatedEvent resourceCreatedEvent -> this.toMessage(resourceCreatedEvent);
            case ResourceDeletedEvent resourceDeletedEvent -> this.toMessage(resourceDeletedEvent);
            default -> Optional.empty();
        };
    }

    private Optional<Message> toMessage(ResourceCreatedEvent event) {
        return this.toMessage(event.resource())
                .map(resource -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ResourceCreatedMessage.class.getSimpleName(),
                        new ResourceCreatedMessage(event.createdOn(), this.toSummary(event.createdBy()), resource)
                ));
    }

    private Optional<Message> toMessage(ResourceDeletedEvent event) {
        return this.toMessage(event.resource())
                .map(resource -> new Message(
                        UUID.randomUUID(),
                        IDomainEventToMessageConverter.FROM,
                        ResourceDeletedMessage.class.getSimpleName(),
                        new ResourceDeletedMessage(event.createdOn(), this.toSummary(event.createdBy()), resource)
                ));
    }

    private Optional<ResourceMessage> toMessage(Resource resource) {
        var optionalCreatedBySummary = this.accountRepository.findById(resource.getCreatedBy().getId()).map(this::toSummary);
        var optionalLastModifiedBySummary = this.accountRepository.findById(resource.getLastModifiedBy().getId()).map(this::toSummary);

        return optionalCreatedBySummary.flatMap(createdBySummary ->
                optionalLastModifiedBySummary.map(lastModifiedBySummary ->
                        new ResourceMessage(
                                resource.getId(),
                                resource.getName(),
                                createdBySummary,
                                resource.getCreatedOn(),
                                lastModifiedBySummary,
                                resource.getLastModifiedOn()
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
