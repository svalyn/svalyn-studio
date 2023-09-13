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

package com.svalyn.studio.domain.history.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.UserIdProvider;
import com.svalyn.studio.domain.history.ChangeProposal;
import com.svalyn.studio.domain.history.repositories.IChangeProposalRepository;
import com.svalyn.studio.domain.history.services.api.IChangeProposalDeletionService;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.MembershipRole;
import com.svalyn.studio.domain.organization.services.api.IOrganizationPermissionService;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to delete change proposals.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeProposalDeletionService implements IChangeProposalDeletionService {

    private final IOrganizationPermissionService organizationPermissionService;

    private final IProjectRepository projectRepository;

    private final IChangeProposalRepository changeProposalRepository;

    private final IMessageService messageService;

    public ChangeProposalDeletionService(IOrganizationPermissionService organizationPermissionService, IProjectRepository projectRepository, IChangeProposalRepository changeProposalRepository, IMessageService messageService) {
        this.organizationPermissionService = Objects.requireNonNull(organizationPermissionService);
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.changeProposalRepository = Objects.requireNonNull(changeProposalRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    private MembershipRole membershipRole(UUID projectId) {
        var userId = UserIdProvider.get().getId();

        return this.projectRepository.findById(projectId)
                .map(Project::getOrganization)
                .map(AggregateReference::getId)
                .map(organizationId -> this.organizationPermissionService.role(userId, organizationId))
                .orElse(MembershipRole.NONE);
    }

    @Override
    public IResult<Void> deleteChangeProposals(List<UUID> changeProposalIds) {
        IResult<Void> result = null;

        Map<UUID, Boolean> canDeleteChangeProposal = new HashMap<>();

        var changeProposals = this.changeProposalRepository.findAllById(changeProposalIds);
        for (var changeProposal: changeProposals) {
            var membershipRole = this.membershipRole(changeProposal.getProject().getId());
            canDeleteChangeProposal.put(changeProposal.getId(), membershipRole != MembershipRole.NONE);
        }

        var canDeleteAllChangeProposals = canDeleteChangeProposal.values().stream().allMatch(Boolean.TRUE::equals);
        if (canDeleteAllChangeProposals) {
            changeProposals.forEach(ChangeProposal::dispose);
            this.changeProposalRepository.deleteAll(changeProposals);
            result = new Success<>(null);
        } else {
            result = new Failure<>(this.messageService.unauthorized());
        }

        return result;
    }
}
