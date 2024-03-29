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
import com.svalyn.studio.domain.account.UserIdProvider;
import org.jmolecules.ddd.annotation.Entity;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * An invitation to join an organization.
 *
 * @author sbegaudeau
 */
@Entity
@Table(name = "invitation")
public class Invitation {

    @Id
    private UUID id;

    private AggregateReference<Account, UUID> memberId;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    public UUID getId() {
        return id;
    }

    public AggregateReference<Account, UUID> getMemberId() {
        return this.memberId;
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

    public static Builder newInvitation() {
        return new Builder();
    }

    /**
     * Used to create new invitations.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private AggregateReference<Account, UUID> memberId;

        public Builder memberId(AggregateReference<Account, UUID> memberId) {
            this.memberId = Objects.requireNonNull(memberId);
            return this;
        }

        public Invitation build() {
            var invitation = new Invitation();
            invitation.memberId = Objects.requireNonNull(memberId);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            invitation.createdBy = userId;
            invitation.createdOn = now;
            invitation.lastModifiedBy = userId;
            invitation.lastModifiedOn = now;

            return invitation;
        }
    }
}
