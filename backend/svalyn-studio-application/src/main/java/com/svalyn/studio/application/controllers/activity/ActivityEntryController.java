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

package com.svalyn.studio.application.controllers.activity;

import com.svalyn.studio.application.controllers.activity.dto.ActivityEntryDTO;
import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.project.dto.ProjectDTO;
import com.svalyn.studio.application.controllers.viewer.Viewer;
import com.svalyn.studio.application.services.activity.api.IActivityService;
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
 * Controller used to manipulate the activity.
 *
 * @author sbegaudeau
 */
@Controller
public class ActivityEntryController {

    private final IActivityService activityService;

    public ActivityEntryController(IActivityService activityService) {
        this.activityService = Objects.requireNonNull(activityService);
    }

    @SchemaMapping(typeName = "Profile")
    public Connection<ActivityEntryDTO> activityEntries(ProfileDTO profile, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.activityService.findAllByUsername(profile.username(), page, rowsPerPage);
        var edges = pageData.stream().map(activityEntry -> {
            var value = new Relay().toGlobalId("ActivityEntry", activityEntry.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<ActivityEntryDTO> edge = new DefaultEdge<>(activityEntry, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, pageData.hasPrevious(), pageData.hasNext(), pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @SchemaMapping(typeName = "Organization")
    public Connection<ActivityEntryDTO> activityEntries(OrganizationDTO organization, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.activityService.findAllByOrganizationId(organization.id(), page, rowsPerPage);
        var edges = pageData.stream().map(activityEntry -> {
            var value = new Relay().toGlobalId("ActivityEntry", activityEntry.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<ActivityEntryDTO> edge = new DefaultEdge<>(activityEntry, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, pageData.hasPrevious(), pageData.hasNext(), pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @SchemaMapping(typeName = "Project")
    public Connection<ActivityEntryDTO> activityEntries(ProjectDTO project, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.activityService.findAllByProjectId(project.id(), page, rowsPerPage);
        var edges = pageData.stream().map(activityEntry -> {
            var value = new Relay().toGlobalId("ActivityEntry", activityEntry.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<ActivityEntryDTO> edge = new DefaultEdge<>(activityEntry, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, pageData.hasPrevious(), pageData.hasNext(), pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @SchemaMapping(typeName = "Viewer")
    public Connection<ActivityEntryDTO> activityEntries(Viewer viewer, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.activityService.findAllVisibleByUsername(viewer.username(), page, rowsPerPage);
        var edges = pageData.stream().map(activityEntry -> {
            var value = new Relay().toGlobalId("ActivityEntry", activityEntry.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<ActivityEntryDTO> edge = new DefaultEdge<>(activityEntry, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, pageData.hasPrevious(), pageData.hasNext(), pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }
}
