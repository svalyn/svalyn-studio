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

package com.svalyn.studio.application.controllers.business;

import com.svalyn.studio.application.controllers.business.dto.DomainDTO;
import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.services.business.api.IDomainService;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultConnectionCursor;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;
import graphql.relay.Relay;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.Objects;

/**
 * Controller used to manipulate domains.
 *
 * @author sbegaudeau
 */
@Controller
public class DomainController {
    private final IDomainService domainService;

    public DomainController(IDomainService domainService) {
        this.domainService = Objects.requireNonNull(domainService);
    }

    @SchemaMapping(typeName = "Viewer")
    public DomainDTO domain(@Argument String identifier) {
        return this.domainService.findByIdentifier(identifier).orElse(null);
    }

    @SchemaMapping(typeName = "Viewer")
    public Connection<DomainDTO> domains(@Argument int page, @Argument int rowsPerPage) {
        var pageData = this.domainService.findAll(page, rowsPerPage);
        var edges = pageData.stream().map(domain -> {
            var value = new Relay().toGlobalId("Domain", domain.identifier());
            var cursor = new DefaultConnectionCursor(value);
            Edge<DomainDTO> edge = new DefaultEdge<>(domain, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, pageData.hasPrevious(), pageData.hasNext(), pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }
}
