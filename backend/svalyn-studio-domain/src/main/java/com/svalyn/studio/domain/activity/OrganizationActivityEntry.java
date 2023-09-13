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

package com.svalyn.studio.domain.activity;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.activity.events.OrganizationActivityEntryCreatedEvent;
import com.svalyn.studio.domain.account.ProfileProvider;
import com.svalyn.studio.domain.organization.Organization;
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
 * The aggregate root of the organization activity entries bounded context.
 *
 * @author sbegaudeau
 */
@AggregateRoot
@Table("organization_activity")
public class OrganizationActivityEntry extends AbstractValidatingAggregateRoot<OrganizationActivityEntry> implements Persistable<UUID> {
    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    @Column("organization_id")
    private AggregateReference<Organization, UUID> organization;

    @Column("activity_id")
    private AggregateReference<ActivityEntry, UUID> activity;

    @Override
    public UUID getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public static Builder newOrganizationActivityEntry() {
        return new Builder();
    }

    /**
     * Used to create new activities.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private AggregateReference<Organization, UUID> organization;

        private AggregateReference<ActivityEntry, UUID> activity;

        private Builder() {
            // Prevent instantiation
        }

        public Builder organization(AggregateReference<Organization, UUID> organization) {
            this.organization = Objects.requireNonNull(organization);
            return this;
        }

        public Builder activity(AggregateReference<ActivityEntry, UUID> activity) {
            this.activity = Objects.requireNonNull(activity);
            return this;
        }

        public OrganizationActivityEntry build() {
            var organizationActivityEntry = new OrganizationActivityEntry();
            organizationActivityEntry.isNew = true;
            organizationActivityEntry.id = UUID.randomUUID();
            organizationActivityEntry.organization = Objects.requireNonNull(this.organization);
            organizationActivityEntry.activity = Objects.requireNonNull(this.activity);

            var createdBy = ProfileProvider.get();
            organizationActivityEntry.registerEvent(new OrganizationActivityEntryCreatedEvent(UUID.randomUUID(), Instant.now(), createdBy, organizationActivityEntry));

            return organizationActivityEntry;
        }
    }
}
