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
package com.svalyn.studio.domain.account;

import com.svalyn.studio.AbstractIntegrationTests;
import com.svalyn.studio.DomainEvents;
import com.svalyn.studio.domain.account.events.AccountCreatedEvent;
import com.svalyn.studio.domain.account.events.AccountModifiedEvent;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests of the account domain.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class AccountIntegrationTests extends AbstractIntegrationTests {
    @Autowired
    private IAccountRepository accountRepository;

    @Autowired
    private DomainEvents domainEvents;

    @BeforeEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @DisplayName("Given an account, when it is persisted, then its id is initialized")
    public void givenAnAccount_whenPersisted_thenHasAnId() {
        var account = Account.newAccount()
                .role(AccountRole.USER)
                .username("username")
                .name("John Doe")
                .email("john.doe@example.org")
                .imageUrl("https://www.example.org/image/avatar.png")
                .build();
        var savedAccount = this.accountRepository.save(account);
        assertThat(savedAccount.getId()).isNotNull();
    }

    @Test
    @DisplayName("Given an account, when it is persisted, then a domain event is published")
    public void givenAnAccount_whenPersisted_thenAnEventIsPublished() {
        var account = Account.newAccount()
                .role(AccountRole.USER)
                .username("username")
                .name("John Doe")
                .email("john.doe@example.org")
                .imageUrl("https://www.example.org/image/avatar.png")
                .build();
        this.accountRepository.save(account);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(AccountCreatedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Given an account, when it's details are updated, then a domain event is published")
    public void givenAnAccount_whenDetailsUpdated_thenAnEventIsPublished() {
        var account = Account.newAccount()
                .role(AccountRole.USER)
                .username("username")
                .name("John Doe")
                .email("john.doe@example.org")
                .imageUrl("https://www.example.org/image/avatar.png")
                .build();
        this.accountRepository.save(account);

        account = this.accountRepository.findById(account.getId()).get();
        account.updateDetails("John T. Doe", "https://www.example.org/image/avatar.png+v2");
        this.accountRepository.save(account);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(AccountModifiedEvent.class::isInstance).count()).isEqualTo(1);
    }
}
