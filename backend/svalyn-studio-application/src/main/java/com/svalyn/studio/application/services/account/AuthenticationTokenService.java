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

import com.svalyn.studio.application.controllers.account.dto.AuthenticationTokenCreatedDTO;
import com.svalyn.studio.application.controllers.account.dto.AuthenticationTokenDTO;
import com.svalyn.studio.application.controllers.account.dto.CreateAuthenticationTokenInput;
import com.svalyn.studio.application.controllers.account.dto.CreateAuthenticationTokenSuccessPayload;
import com.svalyn.studio.application.controllers.account.dto.UpdateAuthenticationTokensStatusInput;
import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.SuccessPayload;
import com.svalyn.studio.application.services.account.api.IAuthenticationTokenService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.AuthenticationToken;
import com.svalyn.studio.domain.account.AuthenticationTokenCreated;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.account.services.api.IAccountUpdateService;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.Objects;

/**
 * Used to manipulate authentication tokens.
 *
 * @author sbegaudeau
 */
@Service
public class AuthenticationTokenService implements IAuthenticationTokenService {

    private final IAccountRepository accountRepository;

    private final IAccountUpdateService accountUpdateService;

    public AuthenticationTokenService(IAccountRepository accountRepository, IAccountUpdateService accountUpdateService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.accountUpdateService = Objects.requireNonNull(accountUpdateService);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<AuthenticationTokenDTO> findAll(int page, int rowsPerPage) {
        var authenticationTokens = this.accountRepository.findById(UserIdProvider.get().getId())
                .map(Account::getAuthenticationTokens)
                .orElse(new LinkedHashSet<>())
                .stream()
                .sorted(Comparator.comparing(AuthenticationToken::getName))
                .map(this::toDTO)
                .toList();

        var fromIndex = Math.min(page * rowsPerPage, authenticationTokens.size());
        var toIndex = Math.min(fromIndex + rowsPerPage, authenticationTokens.size());
        var subList = authenticationTokens.subList(fromIndex, toIndex);

        return new PageImpl<>(subList, PageRequest.of(page, rowsPerPage), authenticationTokens.size());
    }

    private AuthenticationTokenDTO toDTO(AuthenticationToken authenticationToken) {
        return new AuthenticationTokenDTO(authenticationToken.getId(), authenticationToken.getName(), authenticationToken.getStatus(), authenticationToken.getCreatedOn(), authenticationToken.getLastModifiedOn());
    }

    @Override
    @Transactional
    public IPayload createAuthenticationToken(CreateAuthenticationTokenInput input) {
        IPayload payload = null;

        var result = this.accountUpdateService.createAuthenticationToken(input.name());
        if (result instanceof Failure<AuthenticationTokenCreated> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<AuthenticationTokenCreated> success) {
            var authenticationTokenCreatedDTO = new AuthenticationTokenCreatedDTO(success.data().name(), success.data().accessKey(), success.data().secretKey());
            payload = new CreateAuthenticationTokenSuccessPayload(input.id(), authenticationTokenCreatedDTO);
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload updateAuthenticationTokensStatus(UpdateAuthenticationTokensStatusInput input) {
        IPayload payload = null;

        var result = this.accountUpdateService.updateAuthenticationTokensStatus(input.authenticationTokenIds(), input.status());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }
}
