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

package com.svalyn.studio.controllers;

import com.svalyn.studio.AbstractIntegrationTests;
import com.svalyn.studio.WithMockPrincipal;
import com.svalyn.studio.domain.organization.MembershipRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.ExecutionGraphQlService;
import org.springframework.graphql.test.tester.ExecutionGraphQlServiceTester;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests of the organization controller.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings({ "checkstyle:MethodName" })
public class OrganizationControllerIntegrationTests extends AbstractIntegrationTests {
    @Autowired
    private ExecutionGraphQlService graphQlService;

    private void assertRole(MembershipRole role) {
        var tester = ExecutionGraphQlServiceTester.create(this.graphQlService);

        var document = """
        query getOrganization {
          viewer {
            organization(identifier: "mockorganization") {
              role
            }
          }
        }
        """;
        tester.document(document)
                .execute()
                .path("viewer.organization.role")
                .entity(String.class)
                .isEqualTo(role.toString());
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization admin, when a GraphQL query is performed, then it can return the membership role")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganizationAdmin_whenGraphQLQueryPerformed_thenItCanReturnTheMembershipRole() {
        this.assertRole(MembershipRole.ADMIN);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JANE_DOE)
    @DisplayName("Given an organization member, when a GraphQL query is performed, then it can return the membership role")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnOrganizationMember_whenGraphQLQueryPerformed_thenItCanReturnTheMembershipRole() {
        this.assertRole(MembershipRole.MEMBER);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JULES_DOE)
    @DisplayName("Given a non organization member, when a GraphQL query is performed, then it can return the membership role")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenNonOrganizationMember_whenGraphQLQueryPerformed_thenItCanReturnTheMembershipRole() {
        this.assertRole(MembershipRole.NONE);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.ADMIN)
    @DisplayName("Given a server admin, when a GraphQL query is performed, then it can return the membership role")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenServerAdmin_whenGraphQLQueryPerformed_thenItCanReturnTheMembershipRole() {
        this.assertRole(MembershipRole.ADMIN);
    }
}
