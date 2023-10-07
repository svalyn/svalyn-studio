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

package com.svalyn.studio.application.services.history;

import com.svalyn.studio.application.controllers.history.dto.AddResourcesToChangeProposalInput;
import com.svalyn.studio.application.controllers.history.dto.ChangeProposalDTO;
import com.svalyn.studio.application.controllers.history.dto.CreateChangeProposalInput;
import com.svalyn.studio.application.controllers.history.dto.CreateChangeProposalSuccessPayload;
import com.svalyn.studio.application.controllers.history.dto.DeleteChangeProposalsInput;
import com.svalyn.studio.application.controllers.history.dto.PerformReviewInput;
import com.svalyn.studio.application.controllers.history.dto.RemoveResourcesFromChangeProposalInput;
import com.svalyn.studio.application.controllers.history.dto.ReviewDTO;
import com.svalyn.studio.application.controllers.history.dto.UpdateChangeProposalReadMeInput;
import com.svalyn.studio.application.controllers.history.dto.UpdateChangeProposalStatusInput;
import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.controllers.dto.SuccessPayload;
import com.svalyn.studio.application.services.account.api.IAvatarUrlService;
import com.svalyn.studio.application.services.history.api.IChangeProposalService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.history.ChangeProposal;
import com.svalyn.studio.domain.history.ChangeProposalStatus;
import com.svalyn.studio.domain.history.Review;
import com.svalyn.studio.domain.history.repositories.IChangeProposalRepository;
import com.svalyn.studio.domain.history.services.api.IChangeProposalCreationService;
import com.svalyn.studio.domain.history.services.api.IChangeProposalDeletionService;
import com.svalyn.studio.domain.history.services.api.IChangeProposalUpdateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to manipulate change proposals.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeProposalService implements IChangeProposalService {

    private final IAccountRepository accountRepository;

    private final IChangeProposalRepository changeProposalRepository;

    private final IChangeProposalCreationService changeProposalCreationService;

    private final IChangeProposalUpdateService changeProposalUpdateService;

    private final IChangeProposalDeletionService changeProposalDeletionService;

    private final IAvatarUrlService avatarUrlService;

    public ChangeProposalService(IAccountRepository accountRepository, IChangeProposalRepository changeProposalRepository, IChangeProposalCreationService changeProposalCreationService, IChangeProposalUpdateService changeProposalUpdateService, IChangeProposalDeletionService changeProposalDeletionService, IAvatarUrlService avatarUrlService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.changeProposalRepository = Objects.requireNonNull(changeProposalRepository);
        this.changeProposalCreationService = Objects.requireNonNull(changeProposalCreationService);
        this.changeProposalUpdateService = Objects.requireNonNull(changeProposalUpdateService);
        this.changeProposalDeletionService = Objects.requireNonNull(changeProposalDeletionService);
        this.avatarUrlService = Objects.requireNonNull(avatarUrlService);
    }

    private Optional<ChangeProposalDTO> toDTO(ChangeProposal changeProposal) {
        var optionalCreatedByProfile = this.accountRepository.findById(changeProposal.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(changeProposal.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));

        return optionalCreatedByProfile.flatMap(createdBy ->
                optionalLastModifiedByProfile.map(lastModifiedBy ->
                        new ChangeProposalDTO(
                                changeProposal.getProject().getId(),
                                changeProposal.getId(),
                                changeProposal.getName(),
                                changeProposal.getReadMe(),
                                changeProposal.getChange().getId(),
                                changeProposal.getStatus(),
                                changeProposal.getCreatedOn(),
                                createdBy,
                                changeProposal.getLastModifiedOn(),
                                lastModifiedBy
                        )
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ChangeProposalDTO> findById(UUID id) {
        return this.changeProposalRepository.findById(id).flatMap(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChangeProposalDTO> findAllByProjectIdAndStatus(UUID projectId, List<ChangeProposalStatus> status, int page, int rowsPerPage) {
        var stringStatus = status.stream().map(Object::toString).toList();
        var changesProposals = this.changeProposalRepository.findAllByProjectIdAndStatus(projectId, stringStatus, page * rowsPerPage, rowsPerPage)
                .stream()
                .flatMap(changeProposal -> this.toDTO(changeProposal).stream())
                .toList();
        var count = this.changeProposalRepository.countAllByProjectIdAndStatus(projectId, stringStatus);
        return new PageImpl<>(changesProposals, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional
    public IPayload createChangeProposal(CreateChangeProposalInput input) {
        var result = this.changeProposalCreationService.createChangeProposal(input.projectIdentifier(), input.name(), input.resourceIds());
        return switch (result) {
            case Failure<ChangeProposal> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<ChangeProposal> success -> new CreateChangeProposalSuccessPayload(input.id(), this.toDTO(success.data()).orElse(null));
        };
    }

    private Optional<ReviewDTO> toDTO(Review review) {
        var optionalCreatedByProfile = this.accountRepository.findById(review.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(review.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));

        return optionalCreatedByProfile.flatMap(createdBy ->
                optionalLastModifiedByProfile.map(lastModifiedBy ->
                        new ReviewDTO(review.getId(), review.getMessage(), review.getStatus(), review.getCreatedOn(), createdBy, review.getLastModifiedOn(), lastModifiedBy)
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO> findReviews(UUID changeProposalId) {
        return this.changeProposalRepository.findById(changeProposalId)
                .map(ChangeProposal::getReviews)
                .map(reviews -> reviews.stream()
                        .flatMap(review -> this.toDTO(review).stream())
                        .toList())
                .orElse(List.of());

    }

    @Override
    @Transactional
    public IPayload updateChangeProposalReadMe(UpdateChangeProposalReadMeInput input) {
        var result = this.changeProposalUpdateService.updateReadMe(input.changeProposalId(), input.content());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload updateChangeProposalStatus(UpdateChangeProposalStatusInput input) {
        var result = this.changeProposalUpdateService.updateStatus(input.changeProposalId(), input.status());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload addResourcesToChangeProposal(AddResourcesToChangeProposalInput input) {
        var result = this.changeProposalUpdateService.addResources(input.changeProposalId(), input.resourceIds());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload removeResourcesFromChangeProposal(RemoveResourcesFromChangeProposalInput input) {
        var result = this.changeProposalUpdateService.removeResources(input.changeProposalId(), input.changeProposalResourceIds());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload performReview(PerformReviewInput input) {
        var result = this.changeProposalUpdateService.performReview(input.changeProposalId(), input.message(), input.status());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload deleteChangeProposals(DeleteChangeProposalsInput input) {
        var result = this.changeProposalDeletionService.deleteChangeProposals(input.changeProposalIds());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }
}
