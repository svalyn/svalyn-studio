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
import com.svalyn.studio.application.controllers.project.dto.ProjectDTO;
import com.svalyn.studio.application.services.history.api.IBranchService;
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
 * Controller used to manipulate branches.
 *
 * @author sbegaudeau
 */
@Controller
public class BranchController {

    private final IBranchService branchService;

    public BranchController(IBranchService branchService) {
        this.branchService = Objects.requireNonNull(branchService);
    }

    @SchemaMapping(typeName = "Project")
    public Connection<BranchDTO> branches(ProjectDTO project, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.branchService.findAllByProjectId(project.id(), page, rowsPerPage);
        var edges = pageData.stream().map(branch -> {
            var value = new Relay().toGlobalId("Branch", branch.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<BranchDTO> edge = new DefaultEdge<>(branch, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, pageData.hasPrevious(), pageData.hasNext(), pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @SchemaMapping(typeName = "Project")
    public BranchDTO branch(ProjectDTO project, @Argument String name) {
        return this.branchService.findByProjectIdAndName(project.id(), name).orElse(null);
    }
}
