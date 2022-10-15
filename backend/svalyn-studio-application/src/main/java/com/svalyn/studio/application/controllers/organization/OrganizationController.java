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
package com.svalyn.studio.application.controllers.organization;

import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.controllers.organization.dto.CreateOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.DeleteOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.InvitationDTO;
import com.svalyn.studio.application.controllers.organization.dto.LeaveOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.RenameOrganizationInput;
import com.svalyn.studio.application.controllers.project.dto.ProjectDTO;
import com.svalyn.studio.application.services.organization.api.IOrganizationService;
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
 * Controller used to manipulate organizations.
 *
 * @author sbegaudeau
 */
@Controller
public class OrganizationController {
    private final IOrganizationService organizationService;

    public OrganizationController(IOrganizationService organizationService) {
        this.organizationService = Objects.requireNonNull(organizationService);
    }

    @SchemaMapping(typeName = "Viewer")
    public Connection<OrganizationDTO> organizations() {
        var page = this.organizationService.findAll();
        var edges = page.stream().map(organization -> {
            var value = new Relay().toGlobalId("Organization", organization.identifier());
            var cursor = new DefaultConnectionCursor(value);
            Edge<OrganizationDTO> edge = new DefaultEdge<>(organization, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, page.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @SchemaMapping(typeName = "Viewer")
    public OrganizationDTO organization(@Argument String identifier) {
        return this.organizationService.findByIdentifier(identifier).orElse(null);
    }

    @SchemaMapping(typeName = "Invitation")
    public OrganizationDTO organization(InvitationDTO invitation) {
        return this.organizationService.findById(invitation.organizationId()).orElse(null);
    }

    @SchemaMapping(typeName = "Project")
    public OrganizationDTO organization(ProjectDTO project) {
        return this.organizationService.findById(project.organizationId()).orElse(null);
    }

    @MutationMapping
    public IPayload createOrganization(@Argument CreateOrganizationInput input) {
        return this.organizationService.createOrganization(input);
    }

    @MutationMapping
    public IPayload renameOrganization(@Argument RenameOrganizationInput input) {
        return this.organizationService.renameOrganization(input);
    }

    @MutationMapping
    public IPayload leaveOrganization(@Argument LeaveOrganizationInput input) {
        return this.organizationService.leaveOrganization(input);
    }

    @MutationMapping
    public IPayload deleteOrganization(@Argument DeleteOrganizationInput input) {
        return this.organizationService.deleteOrganization(input);
    }
}
