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
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.history.events.BranchCreatedEvent;
import com.svalyn.studio.domain.history.events.BranchModifiedEvent;
import com.svalyn.studio.domain.project.Project;
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
 * A branch used to track changes.
 *
 * @author sbegaudeau
 */
@Table("branch")
public class Branch extends AbstractValidatingAggregateRoot<Branch> implements Persistable<UUID> {
    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private String name;

    @Column("project_id")
    private AggregateReference<Project, UUID> project;

    @Column("change_id")
    private AggregateReference<Change, UUID> change;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    @Override
    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public AggregateReference<Project, UUID> getProject() {
        return project;
    }

    public AggregateReference<Change, UUID> getChange() {
        return change;
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

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public void updateChange(AggregateReference<Change, UUID> change) {
        this.change = Objects.requireNonNull(change);
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();
        this.registerEvent(new BranchModifiedEvent(UUID.randomUUID(), Instant.now(), this));
    }

    public static Builder newBranch() {
        return new Builder();
    }

    /**
     * The builder used to create new branches.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private String name;

        private AggregateReference<Project, UUID> project;

        private AggregateReference<Change, UUID> change;

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder project(AggregateReference<Project, UUID> project) {
            this.project = Objects.requireNonNull(project);
            return this;
        }

        public Builder change(AggregateReference<Change, UUID> change) {
            this.change = Objects.requireNonNull(change);
            return this;
        }

        public Branch build() {
            var branch = new Branch();
            branch.isNew = true;
            branch.id = UUID.randomUUID();
            branch.name = Objects.requireNonNull(name);
            branch.project = Objects.requireNonNull(project);
            branch.change = change;

            var now = Instant.now();
            var userId = UserIdProvider.get();
            branch.createdBy = userId;
            branch.createdOn = now;
            branch.lastModifiedBy = userId;
            branch.lastModifiedOn = now;

            branch.registerEvent(new BranchCreatedEvent(UUID.randomUUID(), now, branch));

            return branch;
        }
    }
}
