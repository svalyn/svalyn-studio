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

package com.svalyn.studio.domain.resource;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.ProfileProvider;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.resource.events.ResourceCreatedEvent;
import com.svalyn.studio.domain.resource.events.ResourceDeletedEvent;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * The aggregate root of the resource bounded context.
 *
 * @author sbegaudeau
 */
@Table("resource")
public class Resource extends AbstractValidatingAggregateRoot<Resource> implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private String name;

    private String path;

    private ContentType contentType;

    private byte[] content;

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public byte[] getContent() {
        return content;
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

    public void dispose() {
        var createdBy = ProfileProvider.get();
        this.registerEvent(new ResourceDeletedEvent(UUID.randomUUID(), Instant.now(), createdBy, this));
    }

    public static Builder newResource() {
        return new Builder();
    }

    /**
     * The builder used to create new resources.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private String name;

        private String path;

        private ContentType contentType;

        private byte[] content;

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder path(String path) {
            this.path = Objects.requireNonNull(path);
            return this;
        }

        public Builder contentType(ContentType contentType) {
            this.contentType = Objects.requireNonNull(contentType);
            return this;
        }

        public Builder content(byte[] content) {
            this.content = Objects.requireNonNull(content);
            return this;
        }

        public Resource build() {
            var resource = new Resource();
            resource.isNew = true;
            resource.id = UUID.randomUUID();
            resource.name = Objects.requireNonNull(name);
            resource.path = Objects.requireNonNull(path);
            resource.contentType = Objects.requireNonNull(contentType);
            resource.content = Objects.requireNonNull(content);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            resource.createdBy = userId;
            resource.createdOn = now;
            resource.lastModifiedBy = userId;
            resource.lastModifiedOn = now;

            var createdBy = ProfileProvider.get();
            resource.registerEvent(new ResourceCreatedEvent(UUID.randomUUID(), now, createdBy, resource));

            return resource;
        }
    }
}
