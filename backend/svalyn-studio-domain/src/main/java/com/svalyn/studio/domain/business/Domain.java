/*
 * Copyright (c) 2023 Stéphane Bégaudeau.
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

package com.svalyn.studio.domain.business;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.ProfileProvider;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.business.events.DomainCreatedEvent;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * The aggregate root of the business bounded context.
 *
 * @author sbegaudeau
 */
@Table("domain")
public class Domain extends AbstractValidatingAggregateRoot<Domain> implements Persistable<UUID> {
    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private String identifier;

    private String version;

    private String label;

    private String documentation;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    @Override
    public UUID getId() {
        return this.id;
    }

    public String getIdentifier() {
        return this.identifier;
    }

    public String getVersion() {
        return this.version;
    }

    public String getLabel() {
        return this.label;
    }

    public String getDocumentation() {
        return this.documentation;
    }

    public AggregateReference<Account, UUID> getCreatedBy() {
        return this.createdBy;
    }

    public Instant getCreatedOn() {
        return this.createdOn;
    }

    public AggregateReference<Account, UUID> getLastModifiedBy() {
        return this.lastModifiedBy;
    }

    public Instant getLastModifiedOn() {
        return this.lastModifiedOn;
    }

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public static Builder newDomain() {
        return new Builder();
    }

    /**
     * Used to create new domains.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private String identifier;

        private String version;

        private String label;

        private String documentation;

        private Builder() {
            // Prevent instantiation
        }

        public Builder identifier(String identifier) {
            this.identifier = Objects.requireNonNull(identifier);
            return this;
        }

        public Builder version(String version) {
            this.version = Objects.requireNonNull(version);
            return this;
        }

        public Builder label(String label) {
            this.label = Objects.requireNonNull(label);
            return this;
        }

        public Builder documentation(String documentation) {
            this.documentation = Objects.requireNonNull(documentation);
            return this;
        }

        public Domain build() {
            var domain = new Domain();
            domain.isNew = true;
            domain.id = UUID.randomUUID();
            domain.identifier = Objects.requireNonNull(this.identifier);
            domain.version = Objects.requireNonNull(this.version);
            domain.label = Objects.requireNonNull(this.label);
            domain.documentation = Objects.requireNonNull(this.documentation);
         
            var now = Instant.now();
            var userId = UserIdProvider.get();
            domain.createdBy = userId;
            domain.createdOn = now;
            domain.lastModifiedBy = userId;
            domain.lastModifiedOn = now;

            var createdBy = ProfileProvider.get();
            domain.registerEvent(new DomainCreatedEvent(UUID.randomUUID(), now, createdBy, domain));

            return domain;
        }
    }
}
