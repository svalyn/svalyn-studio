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

package com.svalyn.studio.infrastructure.initialization;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.AccountRole;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.business.Domain;
import com.svalyn.studio.domain.business.services.EPackageRegistration;
import com.svalyn.studio.domain.business.services.api.IDomainCreationService;
import com.svalyn.studio.infrastructure.security.SvalynSystemUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * Used to register the default domains.
 *
 * @author sbegaudeau
 */
@Service
public class Initializer implements CommandLineRunner {

    private final IAccountRepository accountRepository;

    private final IDomainCreationService domainCreationService;

    private final List<EPackageRegistration> ePackageRegistrations;

    private final Logger logger = LoggerFactory.getLogger(Initializer.class);

    public Initializer(IAccountRepository accountRepository, IDomainCreationService domainCreationService, List<EPackageRegistration> ePackageRegistrations) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.domainCreationService = Objects.requireNonNull(domainCreationService);
        this.ePackageRegistrations = Objects.requireNonNull(ePackageRegistrations);
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        var systemAccount = this.accountRepository.findByUsername("system").orElseGet(() -> {
            var account = Account.newAccount()
                    .role(AccountRole.ADMIN)
                    .username("system")
                    .name("System")
                    .email("system@svalyn.com")
                    .imageUrl("")
                    .build();
            return this.accountRepository.save(account);
        });

        var authentication = SecurityContextHolder.getContext().getAuthentication();

        var systemAuthentication = new UsernamePasswordAuthenticationToken(new SvalynSystemUser(systemAccount.getId()), "", List.of());
        SecurityContextHolder.getContext().setAuthentication(systemAuthentication);

        this.ePackageRegistrations.forEach(ePackageRegistration -> {
            var result = this.domainCreationService.createDomain(ePackageRegistration);
            if (result instanceof Failure<Domain> failure) {
                logger.warn(failure.message());
            }
        });

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
