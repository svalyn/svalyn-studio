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
import com.svalyn.studio.application.controllers.organization.dto.AcceptInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.DeclineInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.InvitationDTO;
import com.svalyn.studio.application.controllers.organization.dto.InviteMemberInput;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.RevokeInvitationInput;
import com.svalyn.studio.application.services.organization.api.IInvitationService;
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

import jakarta.validation.Valid;
import java.util.Objects;

/**
 * Controller used to manipulate invitations.
 *
 * @author sbegaudeau
 */
@Controller
public class InvitationController {
    private final IInvitationService invitationService;

    public InvitationController(IInvitationService invitationService) {
        this.invitationService = Objects.requireNonNull(invitationService);
    }

    @SchemaMapping(typeName = "Viewer")
    public Connection<InvitationDTO> invitations(@Argument int page, @Argument int rowsPerPage) {
        var pageData = this.invitationService.findAll(page, rowsPerPage);
        var edges = pageData.stream().map(invitation -> {
            var value = new Relay().toGlobalId("Invitation", invitation.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<InvitationDTO> edge = new DefaultEdge<>(invitation, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @SchemaMapping(typeName = "Organization")
    public Connection<InvitationDTO> invitations(OrganizationDTO organization, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.invitationService.findAll(organization, page, rowsPerPage);
        var edges = pageData.stream().map(invitation -> {
            var value = new Relay().toGlobalId("Invitation", invitation.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<InvitationDTO> edge = new DefaultEdge<>(invitation, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @MutationMapping
    public IPayload inviteMember(@Argument @Valid InviteMemberInput input) {
        return this.invitationService.inviteMember(input);
    }

    @MutationMapping
    public IPayload revokeInvitation(@Argument @Valid RevokeInvitationInput input) {
        return this.invitationService.revokeInvitation(input);
    }

    @MutationMapping
    public IPayload acceptInvitation(@Argument @Valid AcceptInvitationInput input) {
        return this.invitationService.acceptInvitation(input);
    }

    @MutationMapping
    public IPayload declineInvitation(@Argument @Valid DeclineInvitationInput input) {
        return this.invitationService.declineInvitation(input);
    }
}
