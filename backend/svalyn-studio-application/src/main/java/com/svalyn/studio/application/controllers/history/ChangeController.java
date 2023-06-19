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
import com.svalyn.studio.application.controllers.history.dto.BranchDTO;
import com.svalyn.studio.application.controllers.history.dto.ChangeDTO;
import com.svalyn.studio.application.controllers.history.dto.ChangeProposalDTO;
import com.svalyn.studio.application.services.history.api.IChangeService;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultConnectionCursor;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;
import graphql.relay.Relay;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Controller used to manipulate changes.
 *
 * @author sbegaudeau
 */
@Controller
public class ChangeController {
    private final IChangeService changeService;

    public ChangeController(IChangeService changeService) {
        this.changeService = Objects.requireNonNull(changeService);
    }

    @SchemaMapping(typeName = "Viewer")
    public ChangeDTO change(@Argument UUID id) {
        return this.changeService.findById(id).orElse(null);
    }

    @SchemaMapping(typeName = "ChangeProposal")
    public ChangeDTO change(ChangeProposalDTO changeProposal) {
        return this.changeService.findById(changeProposal.changeId()).orElse(null);
    }

    @SchemaMapping(typeName = "Branch")
    public ChangeDTO change(BranchDTO branch) {
        return Optional.ofNullable(branch.changeId())
                .flatMap(this.changeService::findById)
                .orElse(null);
    }

    @SchemaMapping(typeName = "Branch")
    public Connection<ChangeDTO> changes(BranchDTO branch, @Argument int page, @Argument int rowsPerPage) {
        if (branch.changeId() == null) {
            return new DefaultConnection<>(List.of(), new PageInfoWithCount(null, null, false, false, 0));
        }
        var pageData = this.changeService.findAllFromChangeId(branch.changeId(), page, rowsPerPage);
        var edges = pageData.stream().map(change -> {
            var value = new Relay().toGlobalId("Change", change.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            return (Edge<ChangeDTO>) new DefaultEdge<>(change, cursor);
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.size());
        return new DefaultConnection<>(edges, pageInfo);
    }
}
