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

package com.svalyn.studio.domain.account;

import com.svalyn.studio.AbstractIntegrationTests;
import com.svalyn.studio.DomainEvents;
import com.svalyn.studio.WithMockPrincipal;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.events.AuthenticationTokenCreatedEvent;
import com.svalyn.studio.domain.account.services.api.IAccountUpdateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.formLogin;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.logout;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests of the account update service.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@AutoConfigureMockMvc
@SuppressWarnings({ "checkstyle:MethodName", "checkstyle:IllegalCatch" })
public class AccountUpdateServiceIntegrationTests extends AbstractIntegrationTests {
    @Autowired
    private IAccountUpdateService accountUpdateService;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private DomainEvents domainEvents;

    @BeforeEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an account, when an authentication token is created, then it can be used to log in")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnAccount_whenAuthenticationTokenCreated_thenItCanBeUsedToLogIn() {
        var result = this.accountUpdateService.createAuthenticationToken("New token");
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(AuthenticationTokenCreatedEvent.class::isInstance).count()).isEqualTo(1);

        var success = (Success<AuthenticationTokenCreated>) result;
        var accessKey = success.data().accessKey();
        var secretKey = success.data().secretKey();

        try {
            mvc.perform(logout("/api/logout"));

            mvc.perform(formLogin("/api/login").user(accessKey).password(secretKey))
                    .andExpect(status().isOk())
                    .andExpect(authenticated().withRoles("USER"));
        } catch (Exception exception) {
            fail(exception.getMessage(), exception);
        }
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.ADMIN)
    @DisplayName("Given an admin account, when an authentication token is created, then it can be used to log in")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenAnAdminAccount_whenAuthenticationTokenCreated_thenItCanBeUsedToLogIn() {
        var result = this.accountUpdateService.createAuthenticationToken("New token");
        assertThat(result).isInstanceOf(Success.class);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(AuthenticationTokenCreatedEvent.class::isInstance).count()).isEqualTo(1);

        var success = (Success<AuthenticationTokenCreated>) result;
        var accessKey = success.data().accessKey();
        var secretKey = success.data().secretKey();

        try {
            mvc.perform(logout("/api/logout"));

            mvc.perform(formLogin("/api/login").user(accessKey).password(secretKey))
                    .andExpect(status().isOk())
                    .andExpect(authenticated().withRoles("ADMIN"));
        } catch (Exception exception) {
            fail(exception.getMessage(), exception);
        }
    }


}
