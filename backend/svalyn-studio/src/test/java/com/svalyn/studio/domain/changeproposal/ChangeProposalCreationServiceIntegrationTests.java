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
import com.svalyn.studio.domain.changeproposal.events.ChangeProposalCreatedEvent;
import com.svalyn.studio.domain.changeproposal.services.api.IChangeProposalCreationService;
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
 * Integration tests of the change proposal creation service.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class ChangeProposalCreationServiceIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private IChangeProposalCreationService changeProposalCreationService;

    @Autowired
    private DomainEvents domainEvents;

    @BeforeEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given a change proposal, when it is persisted, then an event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenPersisted_thenAnEventIsPublished() {
        var resourceIds = List.of(UUID.fromString("7f67d4a4-c74e-4dee-94ae-29ac7ebc3d43"));
        var result = this.changeProposalCreationService.createChangeProposal("mockproject", "Initial contribution", resourceIds);
        assertThat(result).isInstanceOf(Success.class);

        if (result instanceof Success<ChangeProposal> success) {
            assertThat(success.data().getId()).isNotNull();
        }

        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeProposalCreatedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JAMES_DOE)
    @DisplayName("Given a change proposal, when it is persisted by an unauthorized user, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenPersistedByUnauthorizedUser_thenAnErrorIsReturned() {
        var resourceIds = List.of(UUID.fromString("7f67d4a4-c74e-4dee-94ae-29ac7ebc3d43"));
        var result = this.changeProposalCreationService.createChangeProposal("mockproject", "Initial contribution", resourceIds);
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeProposalCreatedEvent.class::isInstance).count()).isEqualTo(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.ADMIN)
    @DisplayName("Given a change proposal, when it is persisted by an admin, then an event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenChangeProposal_whenPersistedByAdmin_thenAnEventOsPublished() {
        var resourceIds = List.of(UUID.fromString("7f67d4a4-c74e-4dee-94ae-29ac7ebc3d43"));
        var result = this.changeProposalCreationService.createChangeProposal("mockproject", "Initial contribution", resourceIds);
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeProposalCreatedEvent.class::isInstance).count()).isEqualTo(1);
    }
}
