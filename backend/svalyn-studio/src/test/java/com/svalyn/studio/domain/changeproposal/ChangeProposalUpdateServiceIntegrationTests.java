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

package com.svalyn.studio.domain.changeproposal;

import com.svalyn.studio.AbstractIntegrationTests;
import com.svalyn.studio.DomainEvents;
import com.svalyn.studio.WithMockPrincipal;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.changeproposal.events.ChangeProposalIntegratedEvent;
import com.svalyn.studio.domain.changeproposal.events.ChangeProposalModifiedEvent;
import com.svalyn.studio.domain.changeproposal.events.ResourcesAddedToChangeProposalEvent;
import com.svalyn.studio.domain.changeproposal.events.ResourcesRemovedFromChangeProposalEvent;
import com.svalyn.studio.domain.changeproposal.events.ReviewPerformedEvent;
import com.svalyn.studio.domain.changeproposal.services.api.IChangeProposalUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests of the change proposal update service.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class ChangeProposalUpdateServiceIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private IChangeProposalUpdateService changeProposalUpdateService;

    @Autowired
    private DomainEvents domainEvents;

    @BeforeEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given a change proposal, when its README is updated, then an event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenReadMeUpdated_thenAnEventIsPublished() {
        var result = this.changeProposalUpdateService.updateReadMe(UUID.fromString("60dd31a6-7e0c-47e9-af9f-b290e383822d"), "New README");
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeProposalModifiedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JAMES_DOE)
    @DisplayName("Given a change proposal, when its README is updated by a non member, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenReadMeUpdatedByNonMember_thenAnErrorIsReturned() {
        var result = this.changeProposalUpdateService.updateReadMe(UUID.fromString("60dd31a6-7e0c-47e9-af9f-b290e383822d"), "New README");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given a change proposal, when it is integrated, then multiple events are published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenIntegrated_thenEventsArePublished() {
        var result = this.changeProposalUpdateService.updateStatus(UUID.fromString("60dd31a6-7e0c-47e9-af9f-b290e383822d"), ChangeProposalStatus.INTEGRATED);
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeProposalModifiedEvent.class::isInstance).count()).isEqualTo(1);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeProposalIntegratedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given a change proposal, when it's reviewed', then an event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenReviewed_thenAnEventIsPublished() {
        var result = this.changeProposalUpdateService.performReview(UUID.fromString("60dd31a6-7e0c-47e9-af9f-b290e383822d"), "It looks good", ReviewStatus.APPROVED);
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ReviewPerformedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given a change proposal, when new resources are added', then an event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenNewResourcesAreAdded_thenAnEventIsPublished() {
        var result = this.changeProposalUpdateService.addResources(UUID.fromString("60dd31a6-7e0c-47e9-af9f-b290e383822d"), List.of(UUID.fromString("8d3ac60f-e6e6-4bcc-b795-19f909fe5142"), UUID.fromString("ee466a5c-2b20-42d1-b442-c72b0f33833c")));
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ResourcesAddedToChangeProposalEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given a change proposal, when resources are removed, then an event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenResourcesAreRemoved_thenAnEventIsPublished() {
        var result = this.changeProposalUpdateService.removeResources(UUID.fromString("40cab43e-0de8-48a3-bc95-b3836ea7781c"), List.of(UUID.fromString("5a037854-2edf-4fbe-aa71-16ea786d27be")));
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ResourcesRemovedFromChangeProposalEvent.class::isInstance).count()).isEqualTo(1);
    }

}
