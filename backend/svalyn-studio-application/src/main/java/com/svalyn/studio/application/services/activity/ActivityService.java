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

package com.svalyn.studio.application.services.activity;

import com.svalyn.studio.application.controllers.activity.dto.ActivityEntryDTO;
import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.services.account.api.IAvatarUrlService;
import com.svalyn.studio.application.services.activity.api.IActivityService;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.activity.ActivityEntry;
import com.svalyn.studio.domain.activity.repositories.IActivityEntryRepository;
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
 * Used to manipulate activity entries.
 *
 * @author sbegaudeau
 */
@Service
public class ActivityService implements IActivityService {

    private final IAccountRepository accountRepository;

    private final IActivityEntryRepository activityEntryRepository;

    private final IAvatarUrlService avatarUrlService;


    public ActivityService(IAccountRepository accountRepository, IActivityEntryRepository activityEntryRepository, IAvatarUrlService avatarUrlService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.activityEntryRepository = Objects.requireNonNull(activityEntryRepository);
        this.avatarUrlService = Objects.requireNonNull(avatarUrlService);
    }

    private Optional<ActivityEntryDTO> toDTO(ActivityEntry activityEntry) {
        var optionalCreatedByProfile = this.accountRepository.findById(activityEntry.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername())));

        return optionalCreatedByProfile.map(createdBy -> new ActivityEntryDTO(
                activityEntry.getId(),
                activityEntry.getKind(),
                activityEntry.getTitle(),
                activityEntry.getDescription(),
                activityEntry.getCreatedOn(),
                createdBy));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityEntryDTO> findAllVisibleByUsername(String username, int page, int rowsPerPage) {
        return this.accountRepository.findByUsername(username).map(Account::getId).map(userId -> {
            var activityEntries = this.activityEntryRepository.findAllVisibleByUserId(userId, page * rowsPerPage, rowsPerPage).stream()
                    .flatMap(entry -> this.toDTO(entry).stream())
                    .toList();
            var count = this.activityEntryRepository.countAllByUserId(userId);
            return new PageImpl<>(activityEntries, PageRequest.of(page, rowsPerPage), count);
        }).orElse(new PageImpl<>(List.of()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityEntryDTO> findAllByUsername(String username, int page, int rowsPerPage) {
        return this.accountRepository.findByUsername(username).map(Account::getId).map(userId -> {
            var activityEntries = this.activityEntryRepository.findAllByUserId(userId, page * rowsPerPage, rowsPerPage).stream()
                    .flatMap(entry -> this.toDTO(entry).stream())
                    .toList();
            var count = this.activityEntryRepository.countAllByUserId(userId);
            return new PageImpl<>(activityEntries, PageRequest.of(page, rowsPerPage), count);
        }).orElse(new PageImpl<>(List.of()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityEntryDTO> findAllByOrganizationId(UUID organizationId, int page, int rowsPerPage) {
        var activityEntries = this.activityEntryRepository.findAllByOrganizationId(organizationId, page * rowsPerPage, rowsPerPage).stream()
                .flatMap(entry -> this.toDTO(entry).stream())
                .toList();
        var count = this.activityEntryRepository.countAllByOrganizationId(organizationId);
        return new PageImpl<>(activityEntries, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityEntryDTO> findAllByProjectId(UUID projectId, int page, int rowsPerPage) {
        var activityEntries = this.activityEntryRepository.findAllByProjectId(projectId, page * rowsPerPage, rowsPerPage).stream()
                .flatMap(entry -> this.toDTO(entry).stream())
                .toList();
        var count = this.activityEntryRepository.countAllByProjectId(projectId);
        return new PageImpl<>(activityEntries, PageRequest.of(page, rowsPerPage), count);
    }
}
