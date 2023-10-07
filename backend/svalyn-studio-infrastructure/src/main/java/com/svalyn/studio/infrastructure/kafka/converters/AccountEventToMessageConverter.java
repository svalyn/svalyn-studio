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

import com.svalyn.studio.application.services.account.api.IAvatarUrlService;
import com.svalyn.studio.domain.IDomainEvent;
import com.svalyn.studio.domain.Profile;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.events.AccountCreatedEvent;
import com.svalyn.studio.domain.account.events.AccountModifiedEvent;
import com.svalyn.studio.infrastructure.kafka.converters.api.IDomainEventToMessageConverter;
import com.svalyn.studio.message.Message;
import com.svalyn.studio.message.account.AccountCreatedMessage;
import com.svalyn.studio.message.account.AccountMessage;
import com.svalyn.studio.message.account.AccountModifiedMessage;
import com.svalyn.studio.message.account.AccountSummaryMessage;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to convert account events.
 *
 * @author sbegaudeau
 */
@Service
public class AccountEventToMessageConverter implements IDomainEventToMessageConverter {

    private final IAvatarUrlService avatarUrlService;

    public AccountEventToMessageConverter(IAvatarUrlService avatarUrlService) {
        this.avatarUrlService = Objects.requireNonNull(avatarUrlService);
    }

    @Override
    public Optional<Message> convert(IDomainEvent event) {
        return switch (event) {
            case AccountCreatedEvent accountCreatedEvent -> this.toMessage(accountCreatedEvent);
            case AccountModifiedEvent accountModifiedEvent -> this.toMessage(accountModifiedEvent);
            default -> Optional.empty();
        };
    }

    private Optional<Message> toMessage(AccountCreatedEvent accountCreatedEvent) {
        return Optional.of(new Message(
                UUID.randomUUID(),
                IDomainEventToMessageConverter.FROM,
                AccountCreatedMessage.class.getSimpleName(),
                new AccountCreatedMessage(accountCreatedEvent.createdOn(), this.toMessage(accountCreatedEvent.createdBy()), this.toMessage(accountCreatedEvent.account()))
        ));
    }

    private Optional<Message> toMessage(AccountModifiedEvent accountModifiedEvent) {
        return Optional.of(new Message(
                UUID.randomUUID(),
                IDomainEventToMessageConverter.FROM,
                AccountModifiedMessage.class.getSimpleName(),
                new AccountModifiedMessage(accountModifiedEvent.createdOn(), this.toMessage(accountModifiedEvent.createdBy()), this.toMessage(accountModifiedEvent.account()))
        ));
    }

    private AccountMessage toMessage(Account account) {
        return new AccountMessage(
                account.getId(),
                this.avatarUrlService.imageUrl(account.getUsername()),
                account.getCreatedOn(),
                account.getLastModifiedOn()
        );
    }

    private AccountSummaryMessage toMessage(Profile profile) {
        return new AccountSummaryMessage(profile.id(), profile.name(), profile.username());
    }
}
