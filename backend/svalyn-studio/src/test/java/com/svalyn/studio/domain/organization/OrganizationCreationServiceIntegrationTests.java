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
import com.svalyn.studio.domain.organization.events.OrganizationCreatedEvent;
import com.svalyn.studio.domain.organization.services.api.IOrganizationCreationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests of the organization creation service.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class OrganizationCreationServiceIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private IOrganizationCreationService organizationCreationService;

    @Autowired
    private DomainEvents domainEvents;

    @AfterEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when it is persisted, then its id is initialized")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganization_whenPersisted_thenHasAnId() {
        var result = this.organizationCreationService.createOrganization("svalyn", "Svalyn");
        assertThat(result).isInstanceOf(Success.class);

        if (result instanceof Success<Organization> success) {
            assertThat(success.data().getId()).isNotNull();
        }

        assertThat(this.domainEvents.getDomainEvents().stream().filter(OrganizationCreatedEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an invalid organization identifier, when it is persisted, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnInvalidOrganizationIdentifier_whenPersisted_thenAnErrorIsReturned() {
        var result = this.organizationCreationService.createOrganization("", "Svalyn");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an invalid organization name, when it is persisted, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnInvalidOrganizationName_whenPersisted_thenAnErrorIsReturned() {
        var result = this.organizationCreationService.createOrganization("mockorganization", "");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an existing organization with the same identifier, when its is persisted, then an error is returned")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnExistingOrganizationWithSameIdentifier_whenPersisted_thenAnErrorIsReturned() {
        var result = this.organizationCreationService.createOrganization("mockorganization", "Svalyn");
        assertThat(result).isInstanceOf(Failure.class);
        assertThat(this.domainEvents.getDomainEvents()).hasSize(0);
    }
}
