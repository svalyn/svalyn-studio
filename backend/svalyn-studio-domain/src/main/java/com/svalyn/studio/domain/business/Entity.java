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

package com.svalyn.studio.domain.business;

import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.MappedCollection;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * An entity of the domain.
 *
 * @author sbegaudeau
 */
@Table("entity")
public class Entity implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private String name;

    private String documentation;

    private String extendedEntity;

    private boolean isAbstract;

    @MappedCollection(idColumn = "entity_id")
    private Set<Attribute> attributes = new LinkedHashSet<>();

    @MappedCollection(idColumn = "entity_id")
    private Set<Relation> relations = new LinkedHashSet<>();

    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    @Override
    public UUID getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public String getDocumentation() {
        return this.documentation;
    }

    public String getExtendedEntity() {
        return this.extendedEntity;
    }

    public boolean isAbstract() {
        return this.isAbstract;
    }

    public Set<Attribute> getAttributes() {
        return this.attributes;
    }

    public Set<Relation> getRelations() {
        return this.relations;
    }

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public static Builder newEntity() {
        return new Builder();
    }

    /**
     * Used to create new entities.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private String name;

        private String documentation;

        private String extendedEntity;

        private boolean isAbstract;

        private Set<Attribute> attributes = new LinkedHashSet<>();

        private Set<Relation> relations = new LinkedHashSet<>();

        private Builder() {
            // Prevent instantiation
        }

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder documentation(String documentation) {
            this.documentation = Objects.requireNonNull(documentation);
            return this;
        }

        public Builder extendedEntity(String extendedEntity) {
            this.extendedEntity = extendedEntity;
            return this;
        }

        public Builder isAbstract(boolean isAbstract) {
            this.isAbstract = isAbstract;
            return this;
        }

        public Builder attributes(Set<Attribute> attributes) {
            this.attributes = Objects.requireNonNull(attributes);
            return this;
        }

        public Builder relations(Set<Relation> relations) {
            this.relations = Objects.requireNonNull(relations);
            return this;
        }

        public Entity build() {
            var entity = new Entity();
            entity.isNew = true;
            entity.id = UUID.randomUUID();
            entity.name = Objects.requireNonNull(this.name);
            entity.documentation = Objects.requireNonNull(this.documentation);
            entity.extendedEntity = this.extendedEntity;
            entity.isAbstract = this.isAbstract;
            entity.attributes = Objects.requireNonNull(this.attributes);
            entity.relations = Objects.requireNonNull(this.relations);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            entity.createdBy = userId;
            entity.createdOn = now;
            entity.lastModifiedBy = userId;
            entity.lastModifiedOn = now;

            return entity;
        }
    }
}
