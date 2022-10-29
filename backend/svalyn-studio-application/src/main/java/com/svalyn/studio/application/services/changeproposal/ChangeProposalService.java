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

package com.svalyn.studio.application.services.changeproposal;

import com.svalyn.studio.application.controllers.changeproposal.dto.ChangeProposalDTO;
import com.svalyn.studio.application.controllers.changeproposal.dto.ChangeProposalResourceDTO;
import com.svalyn.studio.application.controllers.changeproposal.dto.CreateChangeProposalInput;
import com.svalyn.studio.application.controllers.changeproposal.dto.CreateChangeProposalSuccessPayload;
import com.svalyn.studio.application.controllers.changeproposal.dto.DeleteChangeProposalsInput;
import com.svalyn.studio.application.controllers.changeproposal.dto.DeleteChangeProposalsSuccessPayload;
import com.svalyn.studio.application.controllers.changeproposal.dto.PerformReviewInput;
import com.svalyn.studio.application.controllers.changeproposal.dto.PerformReviewSuccessPayload;
import com.svalyn.studio.application.controllers.changeproposal.dto.ReviewDTO;
import com.svalyn.studio.application.controllers.changeproposal.dto.UpdateChangeProposalReadMeInput;
import com.svalyn.studio.application.controllers.changeproposal.dto.UpdateChangeProposalReadMeSuccessPayload;
import com.svalyn.studio.application.controllers.changeproposal.dto.UpdateChangeProposalStatusInput;
import com.svalyn.studio.application.controllers.changeproposal.dto.UpdateChangeProposalStatusSuccessPayload;
import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.services.changeproposal.api.IChangeProposalService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.changeproposal.ChangeProposal;
import com.svalyn.studio.domain.changeproposal.repositories.IChangeProposalRepository;
import com.svalyn.studio.domain.changeproposal.services.api.IChangeProposalCreationService;
import com.svalyn.studio.domain.changeproposal.services.api.IChangeProposalDeletionService;
import com.svalyn.studio.domain.changeproposal.services.api.IChangeProposalUpdateService;
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
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

    private final IChangeProposalRepository changeProposalRepository;

    private final IChangeProposalCreationService changeProposalCreationService;

    private final IChangeProposalUpdateService changeProposalUpdateService;

    private final IChangeProposalDeletionService changeProposalDeletionService;

    private final IResourceRepository resourceRepository;

    public ChangeProposalService(IChangeProposalRepository changeProposalRepository, IChangeProposalCreationService changeProposalCreationService, IChangeProposalUpdateService changeProposalUpdateService, IChangeProposalDeletionService changeProposalDeletionService, IResourceRepository resourceRepository) {
        this.changeProposalRepository = Objects.requireNonNull(changeProposalRepository);
        this.changeProposalCreationService = Objects.requireNonNull(changeProposalCreationService);
        this.changeProposalUpdateService = Objects.requireNonNull(changeProposalUpdateService);
        this.changeProposalDeletionService = Objects.requireNonNull(changeProposalDeletionService);
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ChangeProposalDTO> findById(UUID id) {
        return this.changeProposalRepository.findById(id).map(changeProposal -> new ChangeProposalDTO(changeProposal.getProject().getId(), changeProposal.getId(), changeProposal.getName(), changeProposal.getReadMe(), changeProposal.getStatus()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChangeProposalDTO> findAllByProjectId(UUID projectId, int page, int rowsPerPage) {
        var changesProposals = this.changeProposalRepository.findAllByProjectId(projectId, page, rowsPerPage)
                .stream()
                .map(changeProposal -> new ChangeProposalDTO(changeProposal.getProject().getId(), changeProposal.getId(), changeProposal.getName(), changeProposal.getReadMe(), changeProposal.getStatus()))
                .toList();
        var count = this.changeProposalRepository.countAllByProjectId(projectId, page, rowsPerPage);
        return new PageImpl<>(changesProposals, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional
    public IPayload createChangeProposal(CreateChangeProposalInput input) {
        IPayload payload = null;

        var result = this.changeProposalCreationService.createChangeProposal(input.projectIdentifier(), input.name(), input.resourceIds());
        if (result instanceof Failure<ChangeProposal> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<ChangeProposal> success) {
            payload = new CreateChangeProposalSuccessPayload(new ChangeProposalDTO(success.data().getProject().getId(), success.data().getId(), success.data().getName(), success.data().getReadMe(), success.data().getStatus()));
        }

        return payload;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Resource> findChangeProposalResource(UUID changeProposalId, UUID resourceId) {
        return this.changeProposalRepository.findById(changeProposalId)
                .flatMap(changeProposal -> changeProposal.getChangeProposalResources().stream()
                        .filter(changeProposalResource -> resourceId.equals(changeProposalResource.getId()))
                        .findFirst())
                .map(changeProposalResource -> changeProposalResource.getResource().getId())
                .flatMap(this.resourceRepository::findById);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChangeProposalResourceDTO> findChangeProposalResources(UUID changeProposalId) {
        var optionalChangeProposal = this.changeProposalRepository.findById(changeProposalId);
        if (optionalChangeProposal.isPresent()) {
            var changeProposal = optionalChangeProposal.get();
            return changeProposal.getChangeProposalResources().stream()
                    .flatMap(changeProposalResource -> this.resourceRepository.findById(changeProposalResource.getResource().getId())
                            .map(resource -> new ChangeProposalResourceDTO(changeProposalResource.getId(), resource.getName(), new String(resource.getContent(), StandardCharsets.UTF_8)))
                            .stream())
                    .toList();
        }
        return List.of();
    }

    @Override
    public List<ReviewDTO> findReviews(UUID changeProposalId) {
        return this.changeProposalRepository.findById(changeProposalId)
                .map(ChangeProposal::getReviews)
                .map(reviews -> reviews.stream()
                        .map(review -> new ReviewDTO(review.getId(), review.getMessage(), review.getStatus()))
                        .toList())
                .orElse(List.of());

    }

    @Override
    @Transactional
    public IPayload updateChangeProposalReadMe(UpdateChangeProposalReadMeInput input) {
        IPayload payload = null;

        var result = this.changeProposalUpdateService.updateReadMe(input.changeProposalId(), input.content());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new UpdateChangeProposalReadMeSuccessPayload(UUID.randomUUID());
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload updateChangeProposalStatus(UpdateChangeProposalStatusInput input) {
        IPayload payload = null;

        var result = this.changeProposalUpdateService.updateStatus(input.changeProposalId(), input.status());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new UpdateChangeProposalStatusSuccessPayload(UUID.randomUUID());
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload performReview(PerformReviewInput input) {
        IPayload payload = null;

        var result = this.changeProposalUpdateService.performReview(input.changeProposalId(), input.message(), input.status());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new PerformReviewSuccessPayload(UUID.randomUUID());
        }
        return payload;
    }

    @Override
    @Transactional
    public IPayload deleteChangeProposals(DeleteChangeProposalsInput input) {
        IPayload payload = null;

        var result = this.changeProposalDeletionService.deleteChangeProposals(input.changeProposalIds());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new DeleteChangeProposalsSuccessPayload(UUID.randomUUID());
        }

        return payload;
    }
}
