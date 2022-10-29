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

package com.svalyn.studio.domain.changeproposal.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.changeproposal.ChangeProposalStatus;
import com.svalyn.studio.domain.changeproposal.ReviewStatus;
import com.svalyn.studio.domain.changeproposal.repositories.IChangeProposalRepository;
import com.svalyn.studio.domain.changeproposal.services.api.IChangeProposalUpdateService;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.UUID;

/**
 * Used to manipulate change proposals.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeProposalUpdateService implements IChangeProposalUpdateService {

    private final IOrganizationRepository organizationRepository;

    private final IProjectRepository projectRepository;

    private final IChangeProposalRepository changeProposalRepository;

    private final IMessageService messageService;

    public ChangeProposalUpdateService(IOrganizationRepository organizationRepository, IProjectRepository projectRepository, IChangeProposalRepository changeProposalRepository, IMessageService messageService) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.changeProposalRepository = Objects.requireNonNull(changeProposalRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<Void> updateReadMe(UUID changeProposalId, String content) {
        IResult<Void> result = null;

        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        if (optionalChangeProposal.isPresent()) {
            var changeProposal = optionalChangeProposal.get();


            var optionalOrganization = this.projectRepository.findById(changeProposal.getProject().getId())
                    .map(Project::getOrganization)
                    .map(AggregateReference::getId)
                    .flatMap(this.organizationRepository::findById);
            if (optionalOrganization.isPresent()) {
                var organization = optionalOrganization.get();
                var userId = UserIdProvider.get().getId();
                var isMember = organization.getMemberships().stream()
                        .anyMatch(membership -> membership.getMemberId().getId().equals(userId));

                if (isMember) {
                    changeProposal.updateReadMe(content);
                    this.changeProposalRepository.save(changeProposal);

                    result = new Success<>(null);
                } else {
                    result = new Failure<>(this.messageService.unauthorized());
                }
            } else {
                result = new Failure<>(this.messageService.doesNotExist("organization"));
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("change proposal"));
        }

        return result;
    }

    @Override
    public IResult<Void> updateStatus(UUID changeProposalId, ChangeProposalStatus status) {
        IResult<Void> result = null;

        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        if (optionalChangeProposal.isPresent()) {
            var changeProposal = optionalChangeProposal.get();

            var optionalOrganization = this.projectRepository.findById(changeProposal.getProject().getId())
                    .map(Project::getOrganization)
                    .map(AggregateReference::getId)
                    .flatMap(this.organizationRepository::findById);
            if (optionalOrganization.isPresent()) {
                var organization = optionalOrganization.get();
                var userId = UserIdProvider.get().getId();
                var isMember = organization.getMemberships().stream()
                        .anyMatch(membership -> membership.getMemberId().getId().equals(userId));

                if (isMember && changeProposal.getStatus() != status) {
                    changeProposal.updateStatus(status);
                    this.changeProposalRepository.save(changeProposal);

                    result = new Success<>(null);
                } else {
                    result = new Failure<>(this.messageService.unauthorized());
                }
            } else {
                result = new Failure<>(this.messageService.doesNotExist("organization"));
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("change proposal"));
        }

        return result;
    }

    @Override
    public IResult<Void> performReview(UUID changeProposalId, String message, ReviewStatus status) {
        IResult<Void> result = null;

        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        if (optionalChangeProposal.isPresent()) {
            var changeProposal = optionalChangeProposal.get();

            var optionalOrganization = this.projectRepository.findById(changeProposal.getProject().getId())
                    .map(Project::getOrganization)
                    .map(AggregateReference::getId)
                    .flatMap(this.organizationRepository::findById);
            if (optionalOrganization.isPresent()) {
                var organization = optionalOrganization.get();
                var userId = UserIdProvider.get().getId();
                var isMember = organization.getMemberships().stream()
                        .anyMatch(membership -> membership.getMemberId().getId().equals(userId));

                if (isMember) {
                    changeProposal.performReview(message, status);
                    this.changeProposalRepository.save(changeProposal);

                    result = new Success<>(null);
                } else {
                    result = new Failure<>(this.messageService.unauthorized());
                }
            } else {
                result = new Failure<>(this.messageService.doesNotExist("organization"));
            }
        } else {
            result = new Failure<>(this.messageService.doesNotExist("change proposal"));
        }

        return result;
    }
}
