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

import com.svalyn.studio.domain.resource.Resource;
import org.springframework.data.annotation.Id;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.Objects;
import java.util.UUID;

/**
 * Used to connect a change proposal and a resource.
 *
 * @author sbegaudeau
 */
@Table("change_proposal_resource")
public class ChangeProposalResource {
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

    public static Builder newChangeProposalResource() {
        return new Builder();
    }

    /**
     * The builder used to create new change proposal resources.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private AggregateReference<Resource, UUID> resource;

        public Builder resource(AggregateReference<Resource, UUID> resource) {
            this.resource = Objects.requireNonNull(resource);
            return this;
        }

        public ChangeProposalResource build() {
            var changeProposalResource = new ChangeProposalResource();
            changeProposalResource.resource = Objects.requireNonNull(resource);
            return changeProposalResource;
        }
    }
}
