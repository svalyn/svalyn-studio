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

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.events.AccountCreatedEvent;
import com.svalyn.studio.domain.account.events.AccountModifiedEvent;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * The aggregate root of the account domain.
 *
 * It is used to capture the identity of an user in our application.
 *
 * @author sbegaudeau
 */
@Table(name = "account")
public class Account extends AbstractValidatingAggregateRoot<Account> {
    @Id
    private UUID id;

    private String provider;

    private String providerId;

    private String role;

    private String username;

    private String password;

    private String name;

    private String email;

    private String imageUrl;

    private Instant createdOn;

    private Instant lastModifiedOn;

    public UUID getId() {
        return id;
    }

    public String getProvider() {
        return provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public String getRole() {
        return role;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public Instant getLastModifiedOn() {
        return lastModifiedOn;
    }

    public void updateDetails(String name, String imageUrl) {
        this.name = Objects.requireNonNull(name);
        this.imageUrl = Objects.requireNonNull(imageUrl);
        this.lastModifiedOn = Instant.now();
        this.registerEvent(new AccountModifiedEvent(UUID.randomUUID(), Instant.now(), this));
    }

    public static Builder newAccount() {
        return new Builder();
    }

    /**
     * The builder used to create new accounts.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private String provider;

        private String providerId;

        private String role;

        private String username;

        private String password;

        private String name;

        private String email;

        private String imageUrl;

        public Builder provider(String provider) {
            this.provider = Objects.requireNonNull(provider);
            return this;
        }

        public Builder providerId(String providerId) {
            this.providerId = Objects.requireNonNull(providerId);
            return this;
        }

        public Builder role(String role) {
            this.role = Objects.requireNonNull(role);
            return this;
        }

        public Builder username(String username) {
            this.username = Objects.requireNonNull(username);
            return this;
        }

        public Builder password(String password) {
            this.password = Objects.requireNonNull(password);
            return this;
        }

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder email(String email) {
            this.email = Objects.requireNonNull(email);
            return this;
        }

        public Builder imageUrl(String imageUrl) {
            this.imageUrl = Objects.requireNonNull(imageUrl);
            return this;
        }

        public Account build() {
            var account = new Account();
            account.provider = Objects.requireNonNull(provider);
            account.providerId = Objects.requireNonNull(providerId);
            account.role = Objects.requireNonNull(role);
            account.username = Objects.requireNonNull(username);
            account.password = Objects.requireNonNull(password);
            account.name = Objects.requireNonNull(name);
            account.email = Objects.requireNonNull(email);
            account.imageUrl = Objects.requireNonNull(imageUrl);

            var now = Instant.now();
            account.createdOn = now;
            account.lastModifiedOn = now;

            account.registerEvent(new AccountCreatedEvent(UUID.randomUUID(), now, account));
            return account;
        }
    }
}
