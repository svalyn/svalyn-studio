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

package com.svalyn.studio.domain.project;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.ProfileProvider;
import com.svalyn.studio.domain.account.UserIdProvider;
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.project.events.ProjectCreatedEvent;
import com.svalyn.studio.domain.project.events.ProjectDeletedEvent;
import com.svalyn.studio.domain.project.events.ProjectModifiedEvent;
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
 * The aggregate root of the project bounded context.
 *
 * @author sbegaudeau
 */
@AggregateRoot
@Table("project")
public class Project extends AbstractValidatingAggregateRoot<Project> implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    @Column("organization_id")
    private AggregateReference<Organization, UUID> organization;

    private String identifier;

    private String name;

    private String description;

    private String readMe;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    @Override
    public UUID getId() {
        return id;
    }

    public AggregateReference<Organization, UUID> getOrganization() {
        return organization;
    }

    public String getIdentifier() {
        return identifier;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getReadMe() {
        return readMe;
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

    public void updateName(String name) {
        this.name = Objects.requireNonNull(name);
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new ProjectModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
    }

    public void updateDescription(String description) {
        this.description = Objects.requireNonNull(description);
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new ProjectModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
    }

    public void updateReadMe(String readMe) {
        this.readMe = Objects.requireNonNull(readMe);
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new ProjectModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
    }

    public void dispose() {
        var createdBy = ProfileProvider.get();
        this.registerEvent(new ProjectDeletedEvent(UUID.randomUUID(), Instant.now(), createdBy, this));
    }

    public static Builder newProject() {
        return new Builder();
    }

    /**
     * Used to create new projects.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private AggregateReference<Organization, UUID> organization;

        private String identifier;

        private String name;

        private String description;

        private String readMe;

        private Builder() {
            // Prevent instantiation
        }

        public Builder organization(AggregateReference<Organization, UUID> organization) {
            this.organization = Objects.requireNonNull(organization);
            return this;
        }

        public Builder identifier(String identifier) {
            this.identifier = Objects.requireNonNull(identifier);
            return this;
        }

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder description(String description) {
            this.description = Objects.requireNonNull(description);
            return this;
        }

        public Builder readMe(String readMe) {
            this.readMe = Objects.requireNonNull(readMe);
            return this;
        }

        public Project build() {
            var project = new Project();
            project.isNew = true;
            project.id = UUID.randomUUID();
            project.organization = Objects.requireNonNull(this.organization);
            project.identifier = Objects.requireNonNull(this.identifier);
            project.name = Objects.requireNonNull(this.name);
            project.description = Objects.requireNonNull(this.description);
            project.readMe = Objects.requireNonNull(this.readMe);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            project.createdBy = userId;
            project.createdOn = now;
            project.lastModifiedBy = userId;
            project.lastModifiedOn = now;

            var createdBy = ProfileProvider.get();
            project.registerEvent(new ProjectCreatedEvent(UUID.randomUUID(), now, createdBy, project));
            return project;
        }
    }
}
