/*
 * Copyright (c) 2023 Stéphane Bégaudeau.
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

package com.svalyn.studio.domain.account.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.AccountRole;
import com.svalyn.studio.domain.account.PasswordCredentials;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.account.services.api.IAccountCreationService;
import com.svalyn.studio.domain.message.api.IMessageService;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * Used to create accounts.
 *
 * @author sbegaudeau
 */
@Service
public class AccountCreationService implements IAccountCreationService {

    private final IAccountRepository accountRepository;

    private final PasswordEncoder passwordEncoder;

    private final IMessageService messageService;

    public AccountCreationService(IAccountRepository accountRepository, PasswordEncoder passwordEncoder, IMessageService messageService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.passwordEncoder = Objects.requireNonNull(passwordEncoder);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<Account> createAccount(String name, String email, String username, String password) {
        IResult<Account> result = null;

        var isAdmin = Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(authentication -> authentication.getAuthorities().stream()
                        .filter(SimpleGrantedAuthority.class::isInstance)
                        .map(SimpleGrantedAuthority.class::cast)
                        .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_" + AccountRole.ADMIN)))
                .orElse(Boolean.FALSE)
                .booleanValue();

        var alreadyExist = this.accountRepository.existsByUsername(username);
        if (!isAdmin) {
            result = new Failure<>(this.messageService.unauthorized());
        } else if (alreadyExist) {
            result = new Failure<>(this.messageService.alreadyExists("account"));
        } else {
            var passwordCredentials = PasswordCredentials.newPasswordCredentials()
                    .password(this.passwordEncoder.encode(password))
                    .build();

            var account = Account.newAccount()
                    .name(name)
                    .username(username)
                    .email(email)
                    .passwordCredentials(Set.of(passwordCredentials))
                    .oAuth2Metadata(Set.of())
                    .role(AccountRole.USER)
                    .build();

            this.accountRepository.save(account);
            result = new Success<>(account);
        }

        return result;
    }
}
