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

package com.svalyn.studio.infrastructure.security;

import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.AuthenticationTokenStatus;
import com.svalyn.studio.domain.account.PasswordCredentials;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Implementation of the user detail service.
 *
 * @author sbegaudeau
 */
@Service
public class SvalynUserDetailsService implements UserDetailsService {

    private final IAccountRepository accountRepository;

    public SvalynUserDetailsService(IAccountRepository accountRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrAccessKey) throws UsernameNotFoundException {
        return this.findByUsername(usernameOrAccessKey)
                .or(() -> this.findByAccessKey(usernameOrAccessKey))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private Optional<UserDetails> findByUsername(String username) {
        return this.accountRepository.findByUsername(username).flatMap(account -> {
            var optionalPassword = account.getPasswordCredentials().stream()
                    .filter(PasswordCredentials::isActive)
                    .map(PasswordCredentials::getPassword)
                    .findFirst();
            return optionalPassword.map(password -> this.toUserDetails(account, account.getUsername(), password));
        });
    }

    private Optional<UserDetails> findByAccessKey(String accessKey) {
        return this.accountRepository.findByAccessKey(accessKey).flatMap(account -> {
            var optionalAuthenticationToken = account.getAuthenticationTokens().stream()
                    .filter(authenticationToken -> authenticationToken.getStatus() == AuthenticationTokenStatus.ACTIVE)
                    .filter(authenticationToken -> authenticationToken.getAccessKey().equals(accessKey))
                    .findFirst();
            return optionalAuthenticationToken.map(authenticationToken -> this.toUserDetails(account, authenticationToken.getAccessKey(), authenticationToken.getSecretKey()));
        });
    }

    private UserDetails toUserDetails(Account account, String username, String password) {
        return new SvalynUserDetails(
                account.getId(),
                account.getName(),
                account.getImageUrl(),
                username,
                password,
                true,
                true,
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole())));
    }
}
