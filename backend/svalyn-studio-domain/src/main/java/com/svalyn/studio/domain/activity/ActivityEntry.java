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
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.activity.events.ActivityEntryCreatedEvent;
import com.svalyn.studio.domain.account.ProfileProvider;
import com.svalyn.studio.domain.account.UserIdProvider;
import org.jmolecules.ddd.annotation.AggregateRoot;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * The aggregate root of the activity entries bounded context.
 *
 * @author sbegaudeau
 */
@AggregateRoot
@Table("activity")
public class ActivityEntry extends AbstractValidatingAggregateRoot<ActivityEntry> implements Persistable<UUID> {
    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private ActivityKind kind;

    private String title;

    private String description;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    @Override
    public UUID getId() {
        return id;
    }

    public ActivityKind getKind() {
        return kind;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
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

    public static Builder newActivityEntry() {
        return new Builder();
    }

    /**
     * Used to create new activities.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private ActivityKind kind;

        private String title;

        private String description;

        private AggregateReference<Account, UUID> createdBy;

        private Builder() {
            // Prevent instantiation
        }

        public Builder kind(ActivityKind kind) {
            this.kind = Objects.requireNonNull(kind);
            return this;
        }

        public Builder title(String title) {
            this.title = Objects.requireNonNull(title);
            return this;
        }

        public Builder description(String description) {
            this.description = Objects.requireNonNull(description);
            return this;
        }

        public Builder createdBy(AggregateReference<Account, UUID> createdBy) {
            this.createdBy = Objects.requireNonNull(createdBy);
            return this;
        }

        public ActivityEntry build() {
            var activity = new ActivityEntry();
            activity.isNew = true;
            activity.id = UUID.randomUUID();
            activity.kind = Objects.requireNonNull(this.kind);
            activity.title = Objects.requireNonNull(title);
            activity.description = Objects.requireNonNull(description);


            var now = Instant.now();
            activity.createdOn = now;

            if (this.createdBy != null) {
                activity.createdBy = this.createdBy;
            } else {
                var userId = UserIdProvider.get();
                activity.createdBy = userId;

                var createdBy = ProfileProvider.get();
                activity.registerEvent(new ActivityEntryCreatedEvent(UUID.randomUUID(), now, createdBy, activity));
            }
            return activity;
        }
    }
}
