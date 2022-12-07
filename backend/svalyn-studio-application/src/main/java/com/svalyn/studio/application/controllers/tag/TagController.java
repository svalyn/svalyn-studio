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

package com.svalyn.studio.application.controllers.tag;

import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.project.dto.ProjectDTO;
import com.svalyn.studio.application.controllers.tag.dto.AddTagToOrganizationInput;
import com.svalyn.studio.application.controllers.tag.dto.AddTagToProjectInput;
import com.svalyn.studio.application.controllers.tag.dto.TagDTO;
import com.svalyn.studio.application.services.tag.api.ITagService;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultConnectionCursor;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;
import graphql.relay.Relay;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.Objects;

/**
 * Controller used to manipulate tags.
 *
 * @author sbegaudeau
 */
@Controller
public class TagController {

    private final ITagService tagService;

    public TagController(ITagService tagService) {
        this.tagService = Objects.requireNonNull(tagService);
    }

    @SchemaMapping(typeName = "Organization")
    public Connection<TagDTO> tags(OrganizationDTO organization, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.tagService.findAllByOrganizationId(organization.id(), page, rowsPerPage);
        var edges = pageData.stream().map(tag -> {
            var value = new Relay().toGlobalId("Tag", tag.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<TagDTO> edge = new DefaultEdge<>(tag, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @MutationMapping
    public IPayload addTagToOrganization(@Argument @Valid AddTagToOrganizationInput input) {
        return this.tagService.addTagToOrganization(input);
    }

    @SchemaMapping(typeName = "Project")
    public Connection<TagDTO> tags(ProjectDTO project, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.tagService.findAllByProjectId(project.id(), page, rowsPerPage);
        var edges = pageData.stream().map(tag -> {
            var value = new Relay().toGlobalId("Tag", tag.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<TagDTO> edge = new DefaultEdge<>(tag, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @MutationMapping
    public IPayload addTagToProject(@Argument @Valid AddTagToProjectInput input) {
        return this.tagService.addTagToProject(input);
    }
}
