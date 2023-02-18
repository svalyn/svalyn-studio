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

package com.svalyn.studio.application.controllers.history;

import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.controllers.history.dto.ChangeDTO;
import com.svalyn.studio.application.controllers.history.dto.ChangeResourceDTO;
import com.svalyn.studio.application.controllers.history.dto.ChangeResourceMetadataDTO;
import com.svalyn.studio.application.services.history.api.IChangeResourceService;
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
 * Controller used to manipulate change resources.
 *
 * @author sbegaudeau
 */
@Controller
public class ChangeResourceController {

    private final IChangeResourceService changeResourceService;

    public ChangeResourceController(IChangeResourceService changeResourceService) {
        this.changeResourceService = Objects.requireNonNull(changeResourceService);
    }

    @SchemaMapping(typeName = "Change")
    public ChangeResourceDTO resource(ChangeDTO change, @Argument String path, @Argument String name) {
        return this.changeResourceService.findChangeResource(change.id(), path, name).orElse(null);
    }

    @SchemaMapping(typeName = "Change")
    public Connection<ChangeResourceMetadataDTO> resources(ChangeDTO change) {
        var pageData = this.changeResourceService.findChangeResources(change.id());
        var edges = pageData.stream().map(changeResourceDTO -> {
            var value = new Relay().toGlobalId("ChangeResource", changeResourceDTO.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<ChangeResourceMetadataDTO> edge = new DefaultEdge<>(changeResourceDTO, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.size());
        return new DefaultConnection<>(edges, pageInfo);
    }
}
