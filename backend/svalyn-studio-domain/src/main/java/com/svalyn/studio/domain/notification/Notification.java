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

package com.svalyn.studio.domain.notification;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.notification.events.NotificationCreatedEvent;
import com.svalyn.studio.domain.notification.events.NotificationMarkedAsDoneEvent;
import com.svalyn.studio.domain.notification.events.NotificationMarkedAsReadEvent;
import com.svalyn.studio.domain.notification.events.NotificationMarkedAsUnreadEvent;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * The aggregate root of the notification bounded context.
 *
 * @author sbegaudeau
 */
@Table("notification")
public class Notification extends AbstractValidatingAggregateRoot<Notification> implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private String title;

    private AggregateReference<Account, UUID> ownedBy;

    private NotificationStatus status;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    public void updateStatus(NotificationStatus status) {
        this.status = Objects.requireNonNull(status);
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();

        if (status == NotificationStatus.READ) {
            this.registerEvent(new NotificationMarkedAsReadEvent(UUID.randomUUID(), Instant.now(), this));
        } else if (status == NotificationStatus.UNREAD) {
            this.registerEvent(new NotificationMarkedAsUnreadEvent(UUID.randomUUID(), Instant.now(), this));
        } else if (status == NotificationStatus.DONE) {
            this.registerEvent(new NotificationMarkedAsDoneEvent(UUID.randomUUID(), Instant.now(), this));
        }
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public AggregateReference<Account, UUID> getOwnedBy() {
        return ownedBy;
    }

    public NotificationStatus getStatus() {
        return status;
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

    public static Builder newNotification() {
        return new Builder();
    }

    /**
     * Used to create new notifications.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private String title;

        private AggregateReference<Account, UUID> ownedBy;

        private Builder() {
            // Prevent instantiation
        }

        public Builder title(String title) {
            this.title = Objects.requireNonNull(title);
            return this;
        }

        public Builder ownedBy(AggregateReference<Account, UUID> ownedBy) {
            this.ownedBy = Objects.requireNonNull(ownedBy);
            return this;
        }

        public Notification build() {
            var notification = new Notification();
            notification.isNew = true;
            notification.id = UUID.randomUUID();
            notification.title = Objects.requireNonNull(title);
            notification.ownedBy = Objects.requireNonNull(ownedBy);
            notification.status = NotificationStatus.UNREAD;

            var now = Instant.now();
            var userId = UserIdProvider.get();
            notification.createdBy = userId;
            notification.createdOn = now;
            notification.lastModifiedBy = userId;
            notification.lastModifiedOn = now;

            notification.registerEvent(new NotificationCreatedEvent(UUID.randomUUID(), now, notification));
            return notification;
        }
    }
}
