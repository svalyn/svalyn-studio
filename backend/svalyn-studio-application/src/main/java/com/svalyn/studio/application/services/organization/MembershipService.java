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

package com.svalyn.studio.application.services.organization;

import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.Profile;
import com.svalyn.studio.application.controllers.dto.SuccessPayload;
import com.svalyn.studio.application.controllers.organization.dto.MembershipDTO;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.RevokeMembershipsInput;
import com.svalyn.studio.application.services.organization.api.IMembershipService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.organization.Membership;
import com.svalyn.studio.domain.organization.Organization;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.organization.services.api.IOrganizationUpdateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Objects;
import java.util.Set;

/**
 * Used to manipulate memberships.
 *
 * @author sbegaudeau
 */
@Service
@Transactional(readOnly = true)
public class MembershipService implements IMembershipService {

    private final IOrganizationRepository organizationRepository;

    private final IOrganizationUpdateService organizationUpdateService;

    private final IAccountRepository accountRepository;

    public MembershipService(IOrganizationRepository organizationRepository, IOrganizationUpdateService organizationUpdateService, IAccountRepository accountRepository) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.organizationUpdateService = Objects.requireNonNull(organizationUpdateService);
        this.accountRepository = Objects.requireNonNull(accountRepository);
    }
    @Override
    @Transactional(readOnly = true)
    public Page<MembershipDTO> findAll(OrganizationDTO organization, int page, int rowsPerPage) {
        var optionalOrganization = this.organizationRepository.findByIdentifier(organization.identifier());
        var memberships = optionalOrganization.map(Organization::getMemberships).orElse(Set.of());
        var sortedMemberships = memberships.stream()
                .sorted(Comparator.comparing(Membership::getCreatedOn))
                .flatMap(membership -> this.accountRepository.findById(membership.getMemberId().getId())
                        .map(account -> new MembershipDTO(membership.getId(), new Profile(account.getName(), account.getImageUrl())))
                        .stream())
                .toList();

        var fromIndex = Math.min(page * rowsPerPage, sortedMemberships.size());
        var toIndex = Math.min(fromIndex + rowsPerPage, sortedMemberships.size());
        var subList = sortedMemberships.subList(fromIndex, toIndex);
        return new PageImpl<>(subList, PageRequest.of(page, rowsPerPage), sortedMemberships.size());
    }

    @Override
    @Transactional
    public IPayload revokeMemberships(RevokeMembershipsInput input) {
        IPayload payload = null;

        var result = this.organizationUpdateService.revokeMemberships(input.organizationIdentifier(), input.membershipIds());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }
}
