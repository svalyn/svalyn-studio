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
package com.svalyn.studio.domain.organization;

import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Details of the membership to an organization.
 *
 * @author sbegaudeau
 */
@Table(name = "membership")
public class Membership {
    @Id
    private UUID id;

    private AggregateReference<Account, UUID> memberId;

    private MembershipRole role;

    @CreatedBy
    private AggregateReference<Account, UUID> createdBy;

    @CreatedDate
    private Instant createdOn;

    @LastModifiedBy
    private AggregateReference<Account, UUID> lastModifiedBy;

    @LastModifiedDate
    private Instant lastModifiedOn;

    public UUID getId() {
        return id;
    }

    public AggregateReference<Account, UUID> getMemberId() {
        return this.memberId;
    }

    public MembershipRole getRole() {
        return role;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public void updateRole(MembershipRole role) {
        this.role = Objects.requireNonNull(role);

        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();
    }

    public static Builder newMembership() {
        return new Builder();
    }

    /**
     * Used to create new memberships.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private AggregateReference<Account, UUID> memberId;

        private MembershipRole role;

        public Builder memberId(AggregateReference<Account, UUID> memberId) {
            this.memberId = Objects.requireNonNull(memberId);
            return this;
        }

        public Builder role(MembershipRole role) {
            this.role = Objects.requireNonNull(role);
            return this;
        }

        public Membership build() {
            var membership = new Membership();
            membership.memberId = Objects.requireNonNull(memberId);
            membership.role = Objects.requireNonNull(role);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            membership.createdBy = userId;
            membership.createdOn = now;
            membership.lastModifiedBy = userId;
            membership.lastModifiedOn = now;

            return membership;
        }
    }
}
