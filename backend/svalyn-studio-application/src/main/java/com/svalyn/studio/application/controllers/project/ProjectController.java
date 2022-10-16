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

package com.svalyn.studio.application.controllers.project;

import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.project.dto.CreateProjectInput;
import com.svalyn.studio.application.controllers.project.dto.DeleteProjectInput;
import com.svalyn.studio.application.controllers.project.dto.ProjectDTO;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectDescriptionInput;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectNameInput;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectReadMeInput;
import com.svalyn.studio.application.services.project.api.IProjectService;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultConnectionCursor;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;
import graphql.relay.Relay;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.Objects;

/**
 * Controller used to manipulate projects.
 *
 * @author sbegaudeau
 */
@Controller
public class ProjectController {
    private final IProjectService projectService;

    public ProjectController(IProjectService projectService) {
        this.projectService = Objects.requireNonNull(projectService);
    }

    @SchemaMapping(typeName = "Viewer")
    public ProjectDTO project(@Argument String identifier) {
        return this.projectService.findByIdentifier(identifier).orElse(null);
    }

    @SchemaMapping(typeName = "Organization")
    public Connection<ProjectDTO> projects(OrganizationDTO organization) {
        var page = this.projectService.findAllByOrganizationId(organization.id());
        var edges = page.stream().map(project -> {
            var value = new Relay().toGlobalId("Project", project.identifier());
            var cursor = new DefaultConnectionCursor(value);
            Edge<ProjectDTO> edge = new DefaultEdge<>(project, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, page.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @MutationMapping
    public IPayload createProject(@Argument CreateProjectInput input) {
        return this.projectService.createProject(input);
    }

    @MutationMapping
    public IPayload updateProjectName(@Argument UpdateProjectNameInput input) {
        return this.projectService.updateProjectName(input);
    }

    @MutationMapping
    public IPayload updateProjectDescription(@Argument UpdateProjectDescriptionInput input) {
        return this.projectService.updateProjectDescription(input);
    }

    @MutationMapping
    public IPayload updateProjectReadMe(@Argument UpdateProjectReadMeInput input) {
        return this.projectService.updateProjectReadMe(input);
    }

    @MutationMapping
    public IPayload deleteProject(@Argument DeleteProjectInput input) {
        return this.projectService.deleteProject(input);
    }
}
