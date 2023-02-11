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

package com.svalyn.studio.domain.tag;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.ProfileProvider;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.tag.events.TagAddedToProjectEvent;
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
 * Tag applied to a project.
 *
 * @author sbegaudeau
 */
@Table(name = "project_tag")
public class ProjectTag extends AbstractValidatingAggregateRoot<ProjectTag> implements Persistable<UUID> {
    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    @Column("project_id")
    private AggregateReference<Project, UUID> project;

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

    public static Builder newProjectTag() {
        return new Builder();
    }

    /**
     * Used to create project tags.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private AggregateReference<Project, UUID> project;

        private AggregateReference<Tag, UUID> tag;

        public Builder organization(AggregateReference<Project, UUID> project) {
            this.project = Objects.requireNonNull(project);
            return this;
        }

        public Builder tag(AggregateReference<Tag, UUID> tag) {
            this.tag = Objects.requireNonNull(tag);
            return this;
        }

        public ProjectTag build() {
            var projectTag = new ProjectTag();
            projectTag.isNew = true;
            projectTag.id = UUID.randomUUID();
            projectTag.project = Objects.requireNonNull(this.project);
            projectTag.tag = Objects.requireNonNull(this.tag);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            projectTag.createdBy = userId;
            projectTag.createdOn = now;

            var createdBy = ProfileProvider.get();
            projectTag.registerEvent(new TagAddedToProjectEvent(UUID.randomUUID(), now, createdBy, projectTag));

            return projectTag;
        }
    }
}
