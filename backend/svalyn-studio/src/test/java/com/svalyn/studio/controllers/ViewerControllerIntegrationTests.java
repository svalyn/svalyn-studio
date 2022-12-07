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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.ExecutionGraphQlService;
import org.springframework.graphql.test.tester.ExecutionGraphQlServiceTester;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests of the viewer controller.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings({ "checkstyle:MethodName" })
public class ViewerControllerIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private ExecutionGraphQlService graphQlService;

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.ADMIN)
    @DisplayName("Given an admin account, when a GraphQL query is performed, then it can return the viewer")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnAdminAccount_whenGraphQLQueryPerformed_thenItCanReturnTheViewer() {
        var tester = ExecutionGraphQlServiceTester.create(this.graphQlService);

        var document = """
        query getViewer {
          viewer {
            username
          }
        }
        """;
        tester.document(document)
                .execute()
                .path("viewer.username")
                .entity(String.class)
                .isEqualTo("admin");
    }
}
