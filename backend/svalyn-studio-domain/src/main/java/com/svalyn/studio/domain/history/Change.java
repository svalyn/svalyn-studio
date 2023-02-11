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

package com.svalyn.studio.domain.history;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.ProfileProvider;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.history.events.ChangeCreatedEvent;
import com.svalyn.studio.domain.history.events.ChangeDeletedEvent;
import com.svalyn.studio.domain.history.events.ResourcesAddedToChangeEvent;
import com.svalyn.studio.domain.history.events.ResourcesRemovedFromChangeEvent;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.MappedCollection;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * The aggregate root of the change.
 *
 * @author sbegaudeau
 */
@Table("change")
public class Change extends AbstractValidatingAggregateRoot<Change> implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    @Column("parent_id")
    private AggregateReference<Change, UUID> parent;

    private String name;

    @MappedCollection(idColumn = "change_id")
    private Set<ChangeResource> changeResources = new LinkedHashSet<>();

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    @Override
    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Set<ChangeResource> getChangeResources() {
        return changeResources;
    }

    public AggregateReference<Account, UUID> getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public AggregateReference<Account, UUID> getLastModifiedBy() {
        return lastModifiedBy;
    }

    public Instant getLastModifiedOn() {
        return lastModifiedOn;
    }

    public void addChangeResources(List<ChangeResource> changeResources) {
        this.changeResources.addAll(changeResources);

        this.lastModifiedOn = Instant.now();
        this.lastModifiedBy = UserIdProvider.get();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new ResourcesAddedToChangeEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this, changeResources.stream().toList()));
    }

    public void removeChangeResources(List<ChangeResource> changeResources) {
        this.changeResources.removeAll(changeResources);

        this.lastModifiedOn = Instant.now();
        this.lastModifiedBy = UserIdProvider.get();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new ResourcesRemovedFromChangeEvent(UUID.randomUUID(), Instant.now(), createdBy, this, changeResources.stream().toList()));
    }

    public void dispose() {
        var createdBy = ProfileProvider.get();
        this.registerEvent(new ChangeDeletedEvent(UUID.randomUUID(), Instant.now(), createdBy, this));
    }

    public static Builder newChange() {
        return new Builder();
    }

    /**
     * The builder used to create new changes.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private AggregateReference<Change, UUID> parent;

        private String name;

        private Set<ChangeResource> changeResources = new LinkedHashSet<>();

        public Builder parent(AggregateReference<Change, UUID> parent) {
            this.parent = parent;
            return this;
        }

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder changeResources(Set<ChangeResource> changeResources) {
            this.changeResources = Objects.requireNonNull(changeResources);
            return this;
        }

        public Change build() {
            var change = new Change();
            change.isNew = true;
            change.id = UUID.randomUUID();
            change.parent = parent;
            change.name = Objects.requireNonNull(name);
            change.changeResources = Objects.requireNonNull(changeResources);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            change.createdBy = userId;
            change.createdOn = now;
            change.lastModifiedBy = userId;
            change.lastModifiedOn = now;

            var createdBy = ProfileProvider.get();
            change.registerEvent(new ChangeCreatedEvent(UUID.randomUUID(), now, createdBy, change));

            return change;
        }
    }

}
