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
import com.svalyn.studio.application.controllers.organization.dto.MembershipDTO;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.RevokeMembershipsInput;
import com.svalyn.studio.application.services.organization.api.IMembershipService;
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
 * Controller used to manipulate memberships.
 *
 * @author sbegaudeau
 */
@Controller
public class MembershipController {

    private final IMembershipService membershipService;

    public MembershipController(IMembershipService membershipService) {
        this.membershipService = Objects.requireNonNull(membershipService);
    }

    @SchemaMapping(typeName = "Organization")
    public Connection<MembershipDTO> memberships(OrganizationDTO organization, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.membershipService.findAll(organization, page, rowsPerPage);
        var edges = pageData.stream().map(membership -> {
            var value = new Relay().toGlobalId("Membership", membership.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            return (Edge<MembershipDTO>) new DefaultEdge<>(membership, cursor);
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, pageData.hasPrevious(), pageData.hasNext(), pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @MutationMapping
    public IPayload revokeMemberships(@Argument @Valid RevokeMembershipsInput input) {
        return this.membershipService.revokeMemberships(input);
    }
}
