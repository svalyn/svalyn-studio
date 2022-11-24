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

package com.svalyn.studio.domain.organization.services;

import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.AccountRole;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.organization.MembershipRole;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationPermissionService;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.UUID;

/**
 * Used to compute the permission of a user on the organization.
 *
 * @author sbegaudeau
 */
@Service
public class OrganizationPermissionService implements IOrganizationPermissionService {

    private final IAccountRepository accountRepository;

    private final IOrganizationRepository organizationRepository;

    public OrganizationPermissionService(IAccountRepository accountRepository, IOrganizationRepository organizationRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
    }

    @Override
    public MembershipRole role(UUID userId, UUID organizationId) {
        return this.organizationRepository.findMembershipRole(userId, organizationId)
                .orElseGet(() -> this.fromAccount(userId));
    }

    private MembershipRole fromAccount(UUID userId) {
        return this.accountRepository.findById(userId)
                .map(Account::getRole)
                .map(this::toMembershipRole)
                .orElse(MembershipRole.NONE);
    }

    private MembershipRole toMembershipRole(AccountRole accountRole) {
        if (accountRole == AccountRole.ADMIN) {
            return MembershipRole.ADMIN;
        }
        return MembershipRole.NONE;
    }
}
