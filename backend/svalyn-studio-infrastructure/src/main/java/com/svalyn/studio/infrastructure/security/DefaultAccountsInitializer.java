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
import com.svalyn.studio.domain.account.AccountRole;
import com.svalyn.studio.domain.account.PasswordCredentials;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.account.services.api.IPasswordGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Predicate;

/**
 * Used to create the default accounts while the server is starting.
 *
 * @author sbegaudeau
 */
@Service
public class DefaultAccountsInitializer implements CommandLineRunner {
    private final IAccountRepository accountRepository;

    private final IPasswordGenerator passwordGenerator;

    private final PasswordEncoder passwordEncoder;

    private final String defaultAdminPassword;

    private final boolean createAdminAccount;

    private final Logger logger = LoggerFactory.getLogger(DefaultAccountsInitializer.class);

    public DefaultAccountsInitializer(IAccountRepository accountRepository, IPasswordGenerator passwordGenerator, PasswordEncoder passwordEncoder, @Value("${svalyn.accounts.admin.password:}") String defaultAdminPassword, @Value("${svalyn.accounts.admin.enabled:true}") boolean createAdminAccount) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.passwordGenerator = Objects.requireNonNull(passwordGenerator);
        this.passwordEncoder = Objects.requireNonNull(passwordEncoder);
        this.defaultAdminPassword = Objects.requireNonNull(defaultAdminPassword);
        this.createAdminAccount = Objects.requireNonNull(createAdminAccount);
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (this.createAdminAccount && !this.accountRepository.findByUsername("admin").isPresent()) {
            var password = Optional.of(this.defaultAdminPassword)
                    .filter(Predicate.not(String::isBlank))
                    .orElseGet(this.passwordGenerator::generatePassword);

            this.logger.info("The \"admin\" account has been created with the password \"" + password + "\" (ignore the quotes)");

            var passwordCredentials = PasswordCredentials.newPasswordCredentials()
                    .password(this.passwordEncoder.encode(password))
                    .build();

            var adminAccount = Account.newAccount()
                    .role(AccountRole.ADMIN)
                    .username("admin")
                    .passwordCredentials(Set.of(passwordCredentials))
                    .name("Admin")
                    .email("")
                    .imageUrl("")
                    .build();

            this.accountRepository.save(adminAccount);
        }
    }
}
