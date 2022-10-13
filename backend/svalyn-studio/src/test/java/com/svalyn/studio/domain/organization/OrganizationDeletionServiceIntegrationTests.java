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
import com.svalyn.studio.domain.organization.events.OrganizationDeletedEvent;
import com.svalyn.studio.domain.organization.services.api.IOrganizationDeletionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests of the organization domain.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class OrganizationDeletionServiceIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private IOrganizationDeletionService organizationDeletionService;

    @Autowired
    private DomainEvents domainEvents;

    @AfterEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when it's deleted by an admin, then a domain event is published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenDeletedByAdmin_thenAnEventIsPublished() {
        var result = this.organizationDeletionService.deleteOrganization("mockorganization");
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(OrganizationDeletedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JANE_DOE)
    @DisplayName("Given an organization, when it's deleted by a member, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenDeletedByMember_thenAnErrorIsReturned() {
        var result = this.organizationDeletionService.deleteOrganization("mockorganization");
        assertThat(result).isInstanceOf(Failure.class);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JAMES_DOE)
    @DisplayName("Given an organization, when it's deleted by a non member, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenDeletedByNonMember_thenAnErrorIsReturned() {
        var result = this.organizationDeletionService.deleteOrganization("mockorganization");
        assertThat(result).isInstanceOf(Failure.class);
    }
}
