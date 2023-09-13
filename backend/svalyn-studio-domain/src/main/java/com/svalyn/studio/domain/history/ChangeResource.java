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

import com.svalyn.studio.domain.resource.Resource;
import org.jmolecules.ddd.annotation.Entity;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.Objects;
import java.util.UUID;

/**
 * Used to connect a change and a resource.
 *
 * @author sbegaudeau
 */
@Entity
@Table("change_resource")
public class ChangeResource implements Persistable<UUID> {

    @Transient
    private boolean isNew;
    @Id
    private UUID id;

    @Column("resource_id")
    private AggregateReference<Resource, UUID> resource;

    public UUID getId() {
        return id;
    }

    public AggregateReference<Resource, UUID> getResource() {
        return resource;
    }

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public static Builder newChangeResource() {
        return new Builder();
    }

    /**
     * The builder used to create new change resources.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private AggregateReference<Resource, UUID> resource;

        public Builder resource(AggregateReference<Resource, UUID> resource) {
            this.resource = Objects.requireNonNull(resource);
            return this;
        }

        public ChangeResource build() {
            var changeResource = new ChangeResource();
            changeResource.isNew = true;
            changeResource.id = UUID.randomUUID();
            changeResource.resource = Objects.requireNonNull(resource);
            return changeResource;
        }
    }
}
