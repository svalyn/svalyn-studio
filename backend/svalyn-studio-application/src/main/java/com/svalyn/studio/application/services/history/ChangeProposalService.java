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
import com.svalyn.studio.application.services.history.api.IChangeProposalService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.history.ChangeProposal;
import com.svalyn.studio.domain.history.Review;
import com.svalyn.studio.domain.history.repositories.IChangeProposalRepository;
import com.svalyn.studio.domain.history.services.api.IChangeProposalCreationService;
import com.svalyn.studio.domain.history.services.api.IChangeProposalDeletionService;
import com.svalyn.studio.domain.history.services.api.IChangeProposalUpdateService;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
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

    private final IResourceRepository resourceRepository;

    public ChangeProposalService(IAccountRepository accountRepository, IChangeProposalRepository changeProposalRepository, IChangeProposalCreationService changeProposalCreationService, IChangeProposalUpdateService changeProposalUpdateService, IChangeProposalDeletionService changeProposalDeletionService, IResourceRepository resourceRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.changeProposalRepository = Objects.requireNonNull(changeProposalRepository);
        this.changeProposalCreationService = Objects.requireNonNull(changeProposalCreationService);
        this.changeProposalUpdateService = Objects.requireNonNull(changeProposalUpdateService);
        this.changeProposalDeletionService = Objects.requireNonNull(changeProposalDeletionService);
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
    }

    private Optional<ChangeProposalDTO> toDTO(ChangeProposal changeProposal) {
        var optionalCreatedByProfile = this.accountRepository.findById(changeProposal.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), account.getImageUrl()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(changeProposal.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), account.getImageUrl()));

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
    public Page<ChangeProposalDTO> findAllByProjectId(UUID projectId, int page, int rowsPerPage) {
        var changesProposals = this.changeProposalRepository.findAllByProjectId(projectId, page * rowsPerPage, rowsPerPage)
                .stream()
                .flatMap(changeProposal -> this.toDTO(changeProposal).stream())
                .toList();
        var count = this.changeProposalRepository.countAllByProjectId(projectId);
        return new PageImpl<>(changesProposals, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional
    public IPayload createChangeProposal(CreateChangeProposalInput input) {
        IPayload payload = null;

        var result = this.changeProposalCreationService.createChangeProposal(input.projectIdentifier(), input.name(), input.resourceIds());
        if (result instanceof Failure<ChangeProposal> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<ChangeProposal> success) {
            payload = new CreateChangeProposalSuccessPayload(input.id(), this.toDTO(success.data()).orElse(null));
        }

        return payload;
    }

    private Optional<ReviewDTO> toDTO(Review review) {
        var optionalCreatedByProfile = this.accountRepository.findById(review.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), account.getImageUrl()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(review.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), account.getImageUrl()));

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
        IPayload payload = null;

        var result = this.changeProposalUpdateService.updateReadMe(input.changeProposalId(), input.content());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload updateChangeProposalStatus(UpdateChangeProposalStatusInput input) {
        IPayload payload = null;

        var result = this.changeProposalUpdateService.updateStatus(input.changeProposalId(), input.status());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload addResourcesToChangeProposal(AddResourcesToChangeProposalInput input) {
        IPayload payload = null;

        var result = this.changeProposalUpdateService.addResources(input.changeProposalId(), input.resourceIds());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload removeResourcesFromChangeProposal(RemoveResourcesFromChangeProposalInput input) {
        IPayload payload = null;

        var result = this.changeProposalUpdateService.removeResources(input.changeProposalId(), input.changeProposalResourceIds());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload performReview(PerformReviewInput input) {
        IPayload payload = null;

        var result = this.changeProposalUpdateService.performReview(input.changeProposalId(), input.message(), input.status());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload deleteChangeProposals(DeleteChangeProposalsInput input) {
        IPayload payload = null;

        var result = this.changeProposalDeletionService.deleteChangeProposals(input.changeProposalIds());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }
}