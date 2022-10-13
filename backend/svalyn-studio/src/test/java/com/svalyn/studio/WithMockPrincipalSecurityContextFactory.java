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
package com.svalyn.studio;

import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.authentication.IUser;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to create the security context with the mock principal.
 *
 * @author sbegaudeau
 */
public class WithMockPrincipalSecurityContextFactory implements WithSecurityContextFactory<WithMockPrincipal> {

    private final IAccountRepository accountRepository;

    public WithMockPrincipalSecurityContextFactory(IAccountRepository accountRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
    }

    @Override
    public SecurityContext createSecurityContext(WithMockPrincipal annotation) {
        var securityContext = SecurityContextHolder.createEmptyContext();

        var account = this.accountRepository.findById(UUID.fromString(annotation.userId())).get();

        var user = new IUser() {
            @Override
            public UUID getId() {
                return account.getId();
            }

            @Override
            public String getName() {
                return account.getName();
            }

            @Override
            public String getImageUrl() {
                return account.getImageUrl();
            }
        };

        securityContext.setAuthentication(new UsernamePasswordAuthenticationToken(user, "password", List.of()));

        return securityContext;
    }
}
