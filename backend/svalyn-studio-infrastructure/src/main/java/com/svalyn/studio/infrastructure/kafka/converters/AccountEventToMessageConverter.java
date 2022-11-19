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

package com.svalyn.studio.infrastructure.kafka.converters;

import com.svalyn.studio.domain.IDomainEvent;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.events.AccountCreatedEvent;
import com.svalyn.studio.domain.account.events.AccountModifiedEvent;
import com.svalyn.studio.infrastructure.kafka.converters.api.IDomainEventToMessageConverter;
import com.svalyn.studio.infrastructure.kafka.messages.Message;
import com.svalyn.studio.infrastructure.kafka.messages.account.AccountCreatedMessage;
import com.svalyn.studio.infrastructure.kafka.messages.account.AccountMessage;
import com.svalyn.studio.infrastructure.kafka.messages.account.AccountModifiedMessage;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Used to convert account events.
 *
 * @author sbegaudeau
 */
@Service
public class AccountEventToMessageConverter implements IDomainEventToMessageConverter {
    @Override
    public Optional<Message> convert(IDomainEvent event) {
        Optional<Message> optionalMessage = Optional.empty();

        if (event instanceof AccountCreatedEvent accountCreatedEvent) {
            optionalMessage = this.toMessage(accountCreatedEvent);
        } else if (event instanceof AccountModifiedEvent accountModifiedEvent) {
            optionalMessage = this.toMessage(accountModifiedEvent);
        }

        return optionalMessage;
    }

    private Optional<Message> toMessage(AccountCreatedEvent accountCreatedEvent) {
        return Optional.of(new Message(
                UUID.randomUUID(),
                IDomainEventToMessageConverter.FROM,
                AccountCreatedMessage.class.getSimpleName(),
                new AccountCreatedMessage(accountCreatedEvent.createdOn(), this.toMessage(accountCreatedEvent.account()))
        ));
    }

    private Optional<Message> toMessage(AccountModifiedEvent accountModifiedEvent) {
        return Optional.of(new Message(
                UUID.randomUUID(),
                IDomainEventToMessageConverter.FROM,
                AccountModifiedMessage.class.getSimpleName(),
                new AccountModifiedMessage(accountModifiedEvent.createdOn(), this.toMessage(accountModifiedEvent.account()))
        ));
    }

    private AccountMessage toMessage(Account account) {
        return new AccountMessage(
                account.getId(),
                account.getImageUrl(),
                account.getCreatedOn(),
                account.getLastModifiedOn()
        );
    }
}
