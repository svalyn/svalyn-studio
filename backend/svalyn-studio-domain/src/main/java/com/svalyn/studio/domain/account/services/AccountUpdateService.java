/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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
import com.svalyn.studio.domain.account.AuthenticationToken;
import com.svalyn.studio.domain.account.AuthenticationTokenCreated;
import com.svalyn.studio.domain.account.AuthenticationTokenStatus;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.account.services.api.IAccountUpdateService;
import com.svalyn.studio.domain.account.services.api.IPasswordGenerator;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.message.api.IMessageService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to update accounts.
 *
 * @author sbegaudeau
 */
@Service
public class AccountUpdateService implements IAccountUpdateService {

    private final IAccountRepository accountRepository;

    private final IPasswordGenerator passwordGenerator;

    private final IMessageService messageService;

    private final PasswordEncoder passwordEncoder;

    public AccountUpdateService(IAccountRepository accountRepository, IPasswordGenerator passwordGenerator, IMessageService messageService, PasswordEncoder passwordEncoder) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.passwordGenerator = Objects.requireNonNull(passwordGenerator);
        this.messageService = Objects.requireNonNull(messageService);
        this.passwordEncoder = Objects.requireNonNull(passwordEncoder);
    }

    @Override
    public IResult<AuthenticationTokenCreated> createAuthenticationToken(String name) {
        return this.accountRepository.findById(UserIdProvider.get().getId()).map(account -> {
            var hasAlreadyAuthenticationToken = account.getAuthenticationTokens().stream()
                    .map(AuthenticationToken::getName)
                    .anyMatch(name::equals);
            if (hasAlreadyAuthenticationToken) {
                return new Failure<AuthenticationTokenCreated>(this.messageService.alreadyExists("authentication token"));
            }

            var accessKey = UUID.randomUUID().toString();
            var secretKey = this.passwordGenerator.generatePassword();

            var authenticationToken = AuthenticationToken.newTokenCredentials()
                    .name(name)
                    .accessKey(accessKey)
                    .secretKey(this.passwordEncoder.encode(secretKey))
                    .build();
            account.addAuthenticationToken(authenticationToken);
            this.accountRepository.save(account);

            return new Success<>(new AuthenticationTokenCreated(name, accessKey, secretKey));
        }).orElse(new Failure<>(this.messageService.doesNotExist("account")));
    }

    @Override
    public IResult<Void> updateAuthenticationTokensStatus(List<UUID> authenticationTokenIds, AuthenticationTokenStatus status) {
        return this.accountRepository.findById(UserIdProvider.get().getId()).map(account -> {
            var hasAllAuthenticationTokens = authenticationTokenIds.stream()
                    .allMatch(authenticationTokenId -> account.getAuthenticationTokens().stream()
                            .anyMatch(authenticationToken -> authenticationToken.getId().equals(authenticationTokenId)));
            if (!hasAllAuthenticationTokens) {
                return new Failure<Void>(this.messageService.doesNotExist("authentication token"));
            }

            account.updateAuthenticationTokensStatus(authenticationTokenIds, status);
            this.accountRepository.save(account);

            return new Success<Void>(null);
        }).orElse(new Failure<Void>(this.messageService.doesNotExist("account")));
    }
}
