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
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * The literal of an enumeration.
 *
 * @author sbegaudeau
 */
@Table("enumeration_literal")
public class EnumerationLiteral implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private String name;

    private String documentation;

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

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public static Builder newEnumerationLiteral() {
        return new Builder();
    }

    /**
     * Used to create new enumeration literals.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private String name;

        private String documentation;

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

        public EnumerationLiteral build() {
            var enumerationLiteral = new EnumerationLiteral();
            enumerationLiteral.isNew = true;
            enumerationLiteral.id = UUID.randomUUID();
            enumerationLiteral.name = Objects.requireNonNull(this.name);
            enumerationLiteral.documentation = Objects.requireNonNull(this.documentation);

            var now = Instant.now();
            var userId = UserIdProvider.get();
            enumerationLiteral.createdBy = userId;
            enumerationLiteral.createdOn = now;
            enumerationLiteral.lastModifiedBy = userId;
            enumerationLiteral.lastModifiedOn = now;

            return enumerationLiteral;
        }
    }
}
