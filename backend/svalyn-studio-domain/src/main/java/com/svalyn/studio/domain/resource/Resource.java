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

package com.svalyn.studio.domain.resource;

import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.resource.events.ResourceCreatedEvent;
import com.svalyn.studio.domain.resource.events.ResourceDeletedEvent;
import org.springframework.data.annotation.Id;
import org.springframework.data.domain.AbstractAggregateRoot;
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
public class Resource extends AbstractAggregateRoot<Resource> {
    @Id
    private UUID id;

    private String name;

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

    public byte[] getContent() {
        return content;
    }

    public void dispose() {
        this.registerEvent(new ResourceDeletedEvent(UUID.randomUUID(), Instant.now(), this));
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

        private byte[] content;

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder content(byte[] content) {
            this.content = Objects.requireNonNull(content);
            return this;
        }

        public Resource build() {
            var resource = new Resource();
            resource.name = Objects.requireNonNull(name);
            resource.content = Objects.requireNonNull(content);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            resource.createdBy = userId;
            resource.createdOn = now;
            resource.lastModifiedBy = userId;
            resource.lastModifiedOn = now;

            resource.registerEvent(new ResourceCreatedEvent(UUID.randomUUID(), now, resource));

            return resource;
        }
    }
}
