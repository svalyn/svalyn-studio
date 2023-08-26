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

package com.svalyn.studio.application.services.account;

import com.svalyn.studio.application.controllers.account.dto.AccountDTO;
import com.svalyn.studio.application.controllers.account.dto.CreateAccountInput;
import com.svalyn.studio.application.controllers.account.dto.CreateAccountSuccessPayload;
import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.controllers.viewer.Viewer;
import com.svalyn.studio.application.services.account.api.IAccountService;
import com.svalyn.studio.application.services.account.api.IAvatarUrlService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.account.services.api.IAccountCreationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to manipulate accounts.
 *
 * @author sbegaudeau
 */
@Service
public class AccountService implements IAccountService {

    private final IAccountRepository accountRepository;

    private final IAccountCreationService accountCreationService;

    private final IAvatarUrlService avatarUrlService;

    public AccountService(IAccountRepository accountRepository, IAccountCreationService accountCreationService, IAvatarUrlService avatarUrlService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.accountCreationService = accountCreationService;
        this.avatarUrlService = Objects.requireNonNull(avatarUrlService);
    }

    private AccountDTO toDTO(Account account) {
        return new AccountDTO(
                account.getName(),
                account.getUsername(),
                this.avatarUrlService.imageUrl(account.getUsername()),
                account.getEmail(),
                account.getRole(),
                account.getCreatedOn(),
                account.getLastModifiedOn()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Viewer> findViewerById(UUID id) {
        return this.accountRepository.findById(id)
                .map(account -> new Viewer(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getRole()));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProfileDTO> findProfileByUsername(String username) {
        return this.accountRepository.findByUsername(username).map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AccountDTO> findAll(int page, int rowsPerPage) {
        var accounts = this.accountRepository.findAll(page * rowsPerPage, rowsPerPage).stream()
                .map(this::toDTO)
                .toList();
        var count = this.accountRepository.count();
        return new PageImpl<>(accounts, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional
    public IPayload createAccount(CreateAccountInput input) {
        IPayload payload = null;

        var result = this.accountCreationService.createAccount(input.name(), input.email(), input.username(), input.password());
        if (result instanceof Failure<Account> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Account> success) {
            payload = new CreateAccountSuccessPayload(input.id(), this.toDTO(success.data()));
        }

        return payload;
    }
}
