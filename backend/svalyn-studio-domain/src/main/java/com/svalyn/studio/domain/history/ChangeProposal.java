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

package com.svalyn.studio.domain.history;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.ProfileProvider;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.history.events.ChangeProposalCreatedEvent;
import com.svalyn.studio.domain.history.events.ChangeProposalDeletedEvent;
import com.svalyn.studio.domain.history.events.ChangeProposalIntegratedEvent;
import com.svalyn.studio.domain.history.events.ChangeProposalModifiedEvent;
import com.svalyn.studio.domain.history.events.ReviewModifiedEvent;
import com.svalyn.studio.domain.history.events.ReviewPerformedEvent;
import com.svalyn.studio.domain.project.Project;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.MappedCollection;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * The aggregate root of the change proposal bounded context.
 *
 * @author sbegaudeau
 */
@Table("change_proposal")
public class ChangeProposal extends AbstractValidatingAggregateRoot<ChangeProposal> implements Persistable<UUID> {
    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private String name;

    private String readMe;

    private ChangeProposalStatus status;

    @Column("project_id")
    private AggregateReference<Project, UUID> project;

    @Column("change_id")
    private AggregateReference<Change, UUID> change;

    @MappedCollection(idColumn = "change_proposal_id")
    private Set<Review> reviews = new LinkedHashSet<>();

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

    public String getReadMe() {
        return readMe;
    }

    public ChangeProposalStatus getStatus() {
        return status;
    }

    public AggregateReference<Project, UUID> getProject() {
        return project;
    }

    public AggregateReference<Change, UUID> getChange() {
        return change;
    }

    public Set<Review> getReviews() {
        return reviews;
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


    public void updateReadMe(String readMe) {
        this.readMe = Objects.requireNonNull(readMe);
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new ChangeProposalModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
    }

    public void updateStatus(ChangeProposalStatus status) {
        this.status = Objects.requireNonNull(status);
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new ChangeProposalModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));

        if (this.status == ChangeProposalStatus.INTEGRATED) {
            this.registerEvent(new ChangeProposalIntegratedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
        }
    }

    public void performReview(String message, ReviewStatus status) {
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        var optionalExistingReview = this.reviews.stream()
                .filter(review -> review.getCreatedBy().getId().equals(this.lastModifiedBy.getId()))
                .findFirst();
        if (optionalExistingReview.isPresent()) {
            var existingReview = optionalExistingReview.get();
            existingReview.update(message, status);

            this.registerEvent(new ReviewModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this, existingReview));
        } else {
            var review = Review.newReview()
                    .message(message)
                    .status(status)
                    .build();
            this.reviews.add(review);
            this.registerEvent(new ReviewPerformedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this, review));
        }

    }

    public void dispose() {
        var createdBy = ProfileProvider.get();
        this.registerEvent(new ChangeProposalDeletedEvent(UUID.randomUUID(), Instant.now(), createdBy, this));
    }

    public static Builder newChangeProposal() {
        return new Builder();
    }

    /**
     * The builder used to create new change proposals.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private String name;

        private String readMe;

        private AggregateReference<Project, UUID> project;

        private AggregateReference<Change, UUID> change;

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder readMe(String readMe) {
            this.readMe = Objects.requireNonNull(readMe);
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

        public ChangeProposal build() {
            var changeProposal = new ChangeProposal();
            changeProposal.isNew = true;
            changeProposal.id = UUID.randomUUID();
            changeProposal.name = Objects.requireNonNull(name);
            changeProposal.readMe = Objects.requireNonNull(readMe);
            changeProposal.project = Objects.requireNonNull(project);
            changeProposal.change = Objects.requireNonNull(change);
            changeProposal.reviews = new LinkedHashSet<>();
            changeProposal.status = ChangeProposalStatus.OPEN;

            var now = Instant.now();
            var userId = UserIdProvider.get();
            changeProposal.createdBy = userId;
            changeProposal.createdOn = now;
            changeProposal.lastModifiedBy = userId;
            changeProposal.lastModifiedOn = now;

            var createdBy = ProfileProvider.get();
            changeProposal.registerEvent(new ChangeProposalCreatedEvent(UUID.randomUUID(), now, createdBy, changeProposal));

            return changeProposal;
        }
    }
}
