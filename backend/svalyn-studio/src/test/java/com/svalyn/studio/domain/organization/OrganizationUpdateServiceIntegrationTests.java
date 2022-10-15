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

package com.svalyn.studio.domain.organization;

import com.svalyn.studio.AbstractIntegrationTests;
import com.svalyn.studio.DomainEvents;
import com.svalyn.studio.WithMockPrincipal;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.organization.events.InvitationAcceptedEvent;
import com.svalyn.studio.domain.organization.events.InvitationDeclinedEvent;
import com.svalyn.studio.domain.organization.events.InvitationRevokedEvent;
import com.svalyn.studio.domain.organization.events.MemberInvitedEvent;
import com.svalyn.studio.domain.organization.events.MemberLeftEvent;
import com.svalyn.studio.domain.organization.events.MembershipRevokedEvent;
import com.svalyn.studio.domain.organization.events.OrganizationModifiedEvent;
import com.svalyn.studio.domain.organization.services.api.IOrganizationUpdateService;
import org.junit.jupiter.api.AfterEach;
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
 * Integration tests of the organization update service.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class OrganizationUpdateServiceIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private IOrganizationUpdateService organizationUpdateService;

    @Autowired
    private DomainEvents domainEvents;

    @AfterEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when its name is updated by an admin, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenNameUpdatedByAdmin_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.renameOrganization("mockorganization", "Svalyn");
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(OrganizationModifiedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JANE_DOE)
    @DisplayName("Given an organization, when its name is updated by a member, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenNameUpdatedByMember_thenAnErrorIsReturned() {
        var result = this.organizationUpdateService.renameOrganization("mockorganization", "Svalyn");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JAMES_DOE)
    @DisplayName("Given an organization, when its name is updated by a non member, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenNameUpdatedByNonMember_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.renameOrganization("mockorganization", "Svalyn");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when a member leaves, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenTheOnlyAdminLeaves_thenAnErrorIsReturned() {
        var result = this.organizationUpdateService.leaveOrganization("mockorganization");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JANE_DOE)
    @DisplayName("Given an organization, when a member leaves, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenMemberLeaves_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.leaveOrganization("mockorganization");
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(MemberLeftEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JAMES_DOE)
    @DisplayName("Given an organization, when a non member tries to leave, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenNonMemberLeaves_thenAnErrorIsReturned() {
        var result = this.organizationUpdateService.leaveOrganization("mockorganization");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization which does not exist, when the current user leaves, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganizationWhichDoesNotExist_whenCurrentUserLeaves_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.leaveOrganization("svalyn");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when a membership is revoked, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenMembershipRevoked_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.revokeMemberships("mockorganization", List.of(UUID.fromString("65e7f962-4e7e-4738-978e-ac58ab02d6a5")));
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(MembershipRevokedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when a new member is invited, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenMemberInvited_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.inviteMember("mockorganization", UUID.fromString("a685c7d7-b4a4-4d58-8f76-ef05e6392fe4"));
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(MemberInvitedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when an invitation is accepted, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenInvitationAccepted_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.acceptInvitation("mockorganization", UUID.fromString("c3d41db3-02f1-4cec-8d7f-48e8f5eafe2f"));
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(InvitationAcceptedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JULES_DOE)
    @DisplayName("Given an organization, when an invitation is declined, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenInvitationDeclined_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.declineInvitation("mockorganization", UUID.fromString("c3d41db3-02f1-4cec-8d7f-48e8f5eafe2f"));
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(InvitationDeclinedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when an invitation is revoked, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenInvitationRevoked_thenAnEventIsPublished() {
        var result = this.organizationUpdateService.revokeInvitation("mockorganization", UUID.fromString("c3d41db3-02f1-4cec-8d7f-48e8f5eafe2f"));
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(InvitationRevokedEvent.class::isInstance).count()).isEqualTo(1);
    }
}
