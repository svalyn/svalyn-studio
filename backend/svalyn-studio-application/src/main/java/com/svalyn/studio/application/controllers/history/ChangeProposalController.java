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

package com.svalyn.studio.application.controllers.history;

import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.controllers.history.dto.AddResourcesToChangeProposalInput;
import com.svalyn.studio.application.controllers.history.dto.ChangeProposalDTO;
import com.svalyn.studio.application.controllers.history.dto.CreateChangeProposalInput;
import com.svalyn.studio.application.controllers.history.dto.DeleteChangeProposalsInput;
import com.svalyn.studio.application.controllers.history.dto.PerformReviewInput;
import com.svalyn.studio.application.controllers.history.dto.RemoveResourcesFromChangeProposalInput;
import com.svalyn.studio.application.controllers.history.dto.ReviewDTO;
import com.svalyn.studio.application.controllers.history.dto.UpdateChangeProposalReadMeInput;
import com.svalyn.studio.application.controllers.history.dto.UpdateChangeProposalStatusInput;
import com.svalyn.studio.application.controllers.project.dto.ProjectDTO;
import com.svalyn.studio.application.services.history.api.IChangeProposalService;
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
import java.util.UUID;

/**
 * Controller used to manipulate change proposals.
 *
 * @author sbegaudeau
 */
@Controller
public class ChangeProposalController {

    private final IChangeProposalService changeProposalService;

    public ChangeProposalController(IChangeProposalService changeProposalService) {
        this.changeProposalService = Objects.requireNonNull(changeProposalService);
    }

    @SchemaMapping(typeName = "Project")
    public Connection<ChangeProposalDTO> changeProposals(ProjectDTO project, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.changeProposalService.findAllByProjectId(project.id(), page, rowsPerPage);
        var edges = pageData.stream().map(changeProposal -> {
            var value = new Relay().toGlobalId("ChangeProposal", changeProposal.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<ChangeProposalDTO> edge = new DefaultEdge<>(changeProposal, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @SchemaMapping(typeName = "Viewer")
    public ChangeProposalDTO changeProposal(@Argument UUID id) {
        return this.changeProposalService.findById(id).orElse(null);
    }

    @MutationMapping
    public IPayload createChangeProposal(@Argument @Valid CreateChangeProposalInput input) {
        return this.changeProposalService.createChangeProposal(input);
    }

    @SchemaMapping(typeName = "ChangeProposal")
    public Connection<ReviewDTO> reviews(ChangeProposalDTO changeProposal) {
        var pageData = this.changeProposalService.findReviews(changeProposal.id());
        var edges = pageData.stream().map(reviewDTO -> {
            var value = new Relay().toGlobalId("Review", reviewDTO.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<ReviewDTO> edge = new DefaultEdge<>(reviewDTO, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.size());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @MutationMapping
    public IPayload updateChangeProposalReadMe(@Argument @Valid UpdateChangeProposalReadMeInput input) {
        return this.changeProposalService.updateChangeProposalReadMe(input);
    }

    @MutationMapping
    public IPayload updateChangeProposalStatus(@Argument @Valid UpdateChangeProposalStatusInput input) {
        return this.changeProposalService.updateChangeProposalStatus(input);
    }

    @MutationMapping
    public IPayload addResourcesToChangeProposal(@Argument @Valid AddResourcesToChangeProposalInput input) {
        return this.changeProposalService.addResourcesToChangeProposal(input);
    }

    @MutationMapping
    public IPayload removeResourcesFromChangeProposal(@Argument @Valid RemoveResourcesFromChangeProposalInput input) {
        return this.changeProposalService.removeResourcesFromChangeProposal(input);
    }

    @MutationMapping
    public IPayload performReview(@Argument @Valid PerformReviewInput input) {
        return this.changeProposalService.performReview(input);
    }

    @MutationMapping
    public IPayload deleteChangeProposals(@Argument @Valid DeleteChangeProposalsInput input) {
        return this.changeProposalService.deleteChangeProposals(input);
    }
}
