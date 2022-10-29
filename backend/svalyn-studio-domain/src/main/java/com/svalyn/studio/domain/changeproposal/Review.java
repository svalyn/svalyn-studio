/*
 * Copyright (c) 2022 Stéphane Bégaudeau.
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

package com.svalyn.studio.domain.changeproposal;

import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to evaluate the content of a change proposal.
 *
 * @author sbegaudeau
 */
@Table(name = "review")
public class Review {
    @Id
    private UUID id;

    private String message;

    private ReviewStatus status;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    public UUID getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public ReviewStatus getStatus() {
        return status;
    }

    public AggregateReference<Account, UUID> getCreatedBy() {
        return createdBy;
    }

    public void update(String message, ReviewStatus status) {
        this.message = Objects.requireNonNull(message);
        this.status = Objects.requireNonNull(status);
    }

    public static Builder newReview() {
        return new Builder();
    }

    /**
     * Used to create new reviews.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private String message;

        private ReviewStatus status;

        public Builder message(String message) {
            this.message = Objects.requireNonNull(message);
            return this;
        }

        public Builder status(ReviewStatus status) {
            this.status = Objects.requireNonNull(status);
            return this;
        }

        public Review build() {
            var review = new Review();
            review.message = Objects.requireNonNull(message);
            review.status = Objects.requireNonNull(status);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            review.createdBy = userId;
            review.createdOn = now;
            review.lastModifiedBy = userId;
            review.lastModifiedOn = now;
            return review;
        }
    }
}
