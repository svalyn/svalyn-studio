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

package com.svalyn.studio.domain.tag;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.ProfileProvider;
import com.svalyn.studio.domain.account.UserIdProvider;
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.tag.events.TagAddedToOrganizationEvent;
import org.jmolecules.ddd.annotation.AggregateRoot;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Tag applied to an organization.
 *
 * @author sbegaudeau
 */
@AggregateRoot
@Table(name = "organization_tag")
public class OrganizationTag extends AbstractValidatingAggregateRoot<OrganizationTag> implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    @Column("organization_id")
    private AggregateReference<Organization, UUID> organization;

    @Column("tag_id")
    private AggregateReference<Tag, UUID> tag;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    public UUID getId() {
        return id;
    }

    public AggregateReference<Tag, UUID> getTag() {
        return tag;
    }

    public AggregateReference<Account, UUID> getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public static Builder newOrganizationTag() {
        return new Builder();
    }

    /**
     * Used to create organization tags.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private AggregateReference<Organization, UUID> organization;

        private AggregateReference<Tag, UUID> tag;

        public Builder organization(AggregateReference<Organization, UUID> organization) {
            this.organization = Objects.requireNonNull(organization);
            return this;
        }

        public Builder tag(AggregateReference<Tag, UUID> tag) {
            this.tag = Objects.requireNonNull(tag);
            return this;
        }

        public OrganizationTag build() {
            var organizationTag = new OrganizationTag();
            organizationTag.isNew = true;
            organizationTag.id = UUID.randomUUID();
            organizationTag.organization = Objects.requireNonNull(this.organization);
            organizationTag.tag = Objects.requireNonNull(this.tag);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            organizationTag.createdBy = userId;
            organizationTag.createdOn = now;

            var createdBy = ProfileProvider.get();
            organizationTag.registerEvent(new TagAddedToOrganizationEvent(UUID.randomUUID(), now, createdBy, organizationTag));

            return organizationTag;
        }
    }
}
