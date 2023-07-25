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

package com.svalyn.studio.application.services.history;

import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.controllers.history.dto.BranchDTO;
import com.svalyn.studio.application.services.account.api.IAvatarUrlService;
import com.svalyn.studio.application.services.history.api.IBranchService;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.history.Branch;
import com.svalyn.studio.domain.history.repositories.IBranchRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to manipulate branches.
 *
 * @author sbegaudeau
 */
@Service
public class BranchService implements IBranchService {

    private final IAccountRepository accountRepository;
    private final IBranchRepository branchRepository;

    private final IAvatarUrlService avatarUrlService;

    public BranchService(IAccountRepository accountRepository, IBranchRepository branchRepository, IAvatarUrlService avatarUrlService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.branchRepository = Objects.requireNonNull(branchRepository);
        this.avatarUrlService = Objects.requireNonNull(avatarUrlService);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BranchDTO> findAllByProjectId(UUID projectId, int page, int rowsPerPage) {
        var branches = this.branchRepository.findAllByProjectId(projectId, page * rowsPerPage, rowsPerPage)
                .stream()
                .flatMap(branch -> this.toDTO(branch).stream())
                .toList();
        var count = this.branchRepository.countAllByProjectId(projectId);
        return new PageImpl<>(branches, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BranchDTO> findByProjectIdAndName(UUID projectId, String name) {
        return this.branchRepository.findByProjectIdAndName(projectId, name).flatMap(this::toDTO);
    }

    private Optional<BranchDTO> toDTO(Branch branch) {
        var optionalCreatedByProfile = this.accountRepository.findById(branch.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername())));
        var optionalLastModifiedByProfile = this.accountRepository.findById(branch.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername())));
        var changeId = Optional.ofNullable(branch.getChange()).map(AggregateReference::getId).orElse(null);

        return optionalCreatedByProfile.flatMap(createdBy ->
                optionalLastModifiedByProfile.map(lastModifiedBy ->
                        new BranchDTO(
                                branch.getId(),
                                branch.getName(),
                                changeId,
                                branch.getCreatedOn(),
                                createdBy,
                                branch.getLastModifiedOn(),
                                lastModifiedBy
                        )
                )
        );
    }
}
