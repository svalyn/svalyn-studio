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
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.account.services.api.IAccountDeletionService;
import com.svalyn.studio.domain.account.services.api.IAccountSessionCleaner;
import com.svalyn.studio.domain.account.services.api.IAuthorizationService;
import com.svalyn.studio.domain.message.api.IMessageService;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Used to delete accounts.
 *
 * @author sbegaudeau
 */
@Service
public class AccountDeletionService implements IAccountDeletionService {

    private final IAccountRepository accountRepository;

    private final IAuthorizationService authorizationService;

    private final IAccountSessionCleaner accountSessionCleaner;

    private final IMessageService messageService;

    public AccountDeletionService(IAccountRepository accountRepository, IAuthorizationService authorizationService, IAccountSessionCleaner accountSessionCleaner, IMessageService messageService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.authorizationService = Objects.requireNonNull(authorizationService);
        this.accountSessionCleaner = Objects.requireNonNull(accountSessionCleaner);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<Void> deleteAccount(String username) {
        IResult<Void> result = null;

        var isAdmin = this.authorizationService.isAdmin();
        var isCurrentUser = username.equals(this.authorizationService.getUsername());
        var optionalAccount = this.accountRepository.findByUsername(username);

        if (!isAdmin && !isCurrentUser) {
            result = new Failure<>(this.messageService.unauthorized());
        } else if (optionalAccount.isEmpty()) {
            result = new Failure<>(this.messageService.doesNotExist("account"));
        } else {
            var account = optionalAccount.get();
            account.dispose();

            this.accountRepository.save(account);
            this.accountSessionCleaner.cleanSessions(username);

            result = new Success<>(null);
        }

        return result;
    }
}
