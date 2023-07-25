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

package com.svalyn.studio.domain.account;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.Profile;
import com.svalyn.studio.domain.account.events.AccountCreatedEvent;
import com.svalyn.studio.domain.account.events.AccountModifiedEvent;
import com.svalyn.studio.domain.account.events.AuthenticationTokenCreatedEvent;
import com.svalyn.studio.domain.account.events.AuthenticationTokenModifiedEvent;
import com.svalyn.studio.domain.account.events.OAuth2MetadataCreatedEvent;
import com.svalyn.studio.domain.authentication.ProfileProvider;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.MappedCollection;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * The aggregate root of the account domain.
 *
 * It is used to capture the identity of a user in our application.
 *
 * @author sbegaudeau
 */
@Table(name = "account")
public class Account extends AbstractValidatingAggregateRoot<Account> implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private AccountRole role;

    private String username;

    private String name;

    private String email;

    private byte[] image;

    private String imageContentType;

    @MappedCollection(idColumn = "account_id")
    private Set<PasswordCredentials> passwordCredentials = new LinkedHashSet<>();

    @MappedCollection(idColumn = "account_id")
    private Set<OAuth2Metadata> oAuth2Metadata = new LinkedHashSet<>();

    @MappedCollection(idColumn = "account_id")
    private Set<AuthenticationToken> authenticationTokens = new LinkedHashSet<>();

    private Instant createdOn;

    private Instant lastModifiedOn;

    public UUID getId() {
        return id;
    }

    public AccountRole getRole() {
        return role;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public byte[] getImage() {
        return image;
    }

    public String getImageContentType() {
        return imageContentType;
    }

    public Set<PasswordCredentials> getPasswordCredentials() {
        return passwordCredentials;
    }

    public Set<OAuth2Metadata> getOAuth2Metadata() {
        return oAuth2Metadata;
    }

    public Set<AuthenticationToken> getAuthenticationTokens() {
        return authenticationTokens;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public Instant getLastModifiedOn() {
        return lastModifiedOn;
    }

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public void updateName(String name) {
        this.name = Objects.requireNonNull(name);
        this.lastModifiedOn = Instant.now();

        var createdBy = new Profile(this.id, this.name, this.username);
        this.registerEvent(new AccountModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
    }

    public void addOAuth2Metadata(OAuth2Metadata oAuth2Metadata) {
        this.oAuth2Metadata.add(oAuth2Metadata);
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new OAuth2MetadataCreatedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
    }

    public void addAuthenticationToken(AuthenticationToken authenticationToken) {
        this.authenticationTokens.add(authenticationToken);
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new AuthenticationTokenCreatedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
    }

    public void updateAuthenticationTokensStatus(List<UUID> authenticationTokenIds, AuthenticationTokenStatus status) {
        this.lastModifiedOn = Instant.now();

        this.authenticationTokens.stream()
                .filter(authenticationToken -> authenticationTokenIds.contains(authenticationToken.getId()))
                .forEach(authenticationToken -> {
                    authenticationToken.updateStatus(status);

                    var createdBy = ProfileProvider.get();
                    this.registerEvent(new AuthenticationTokenModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
                });
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

        private AccountRole role;

        private String username;

        private String name;

        private String email;

        private byte[] image;

        private String imageContentType;

        private Set<PasswordCredentials> passwordCredentials = new LinkedHashSet<>();

        private Set<OAuth2Metadata> oAuth2Metadata = new LinkedHashSet<>();

        public Builder passwordCredentials(Set<PasswordCredentials> passwordCredentials) {
            this.passwordCredentials = Objects.requireNonNull(passwordCredentials);
            return this;
        }

        public Builder oAuth2Metadata(Set<OAuth2Metadata> oAuth2Metadata) {
            this.oAuth2Metadata = Objects.requireNonNull(oAuth2Metadata);
            return this;
        }

        public Builder role(AccountRole role) {
            this.role = Objects.requireNonNull(role);
            return this;
        }

        public Builder username(String username) {
            this.username = Objects.requireNonNull(username);
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

        public Builder image(byte[] image) {
            this.image = Objects.requireNonNull(image);
            return this;
        }

        public Builder imageContentType(String imageContentType) {
            this.imageContentType = Objects.requireNonNull(imageContentType);
            return this;
        }

        public Account build() {
            var account = new Account();
            account.isNew = true;
            account.id = UUID.randomUUID();
            account.role = Objects.requireNonNull(role);
            account.username = Objects.requireNonNull(username);
            account.name = Objects.requireNonNull(name);
            account.email = Objects.requireNonNull(email);
            account.image = image;
            account.imageContentType = imageContentType;

            account.passwordCredentials = Objects.requireNonNull(passwordCredentials);
            account.oAuth2Metadata = Objects.requireNonNull(oAuth2Metadata);

            var now = Instant.now();
            account.createdOn = now;
            account.lastModifiedOn = now;

            var createdBy = new Profile(account.id, name, username);
            account.registerEvent(new AccountCreatedEvent(UUID.randomUUID(), now, createdBy, account));
            return account;
        }
    }
}
