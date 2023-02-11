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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.controllers.history.dto.ChangeDTO;
import com.svalyn.studio.application.controllers.history.dto.ChangeResourceDTO;
import com.svalyn.studio.application.services.history.api.IChangeService;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.history.Change;
import com.svalyn.studio.domain.history.repositories.IChangeRepository;
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to manipulate changes.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeService implements IChangeService {

    private final IAccountRepository accountRepository;

    private final IChangeRepository changeRepository;

    private final IResourceRepository resourceRepository;

    private final Logger logger = LoggerFactory.getLogger(ChangeService.class);

    public ChangeService(IAccountRepository accountRepository, IChangeRepository changeRepository, IResourceRepository resourceRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.changeRepository = Objects.requireNonNull(changeRepository);
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
    }

    private Optional<ChangeDTO> toDTO(Change change) {
        var optionalCreatedByProfile = this.accountRepository.findById(change.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), account.getImageUrl()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(change.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), account.getImageUrl()));

        return optionalCreatedByProfile.flatMap(createdBy ->
                optionalLastModifiedByProfile.map(lastModifiedBy ->
                        new ChangeDTO(
                                change.getId(),
                                change.getName(),
                                change.getCreatedOn(),
                                createdBy,
                                change.getLastModifiedOn(),
                                lastModifiedBy
                        )
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ChangeDTO> findById(UUID changeId) {
        return this.changeRepository.findById(changeId).flatMap(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChangeDTO> findAllFromChangeId(UUID changeId, int page, int rowsPerPage) {
        var jsonPath = this.changeRepository.getJsonPath(changeId);

        List<ChangeDTO> changes = List.of();

        try {
            changes = new ObjectMapper().readValue(jsonPath, new TypeReference<>() { });
        } catch (JsonProcessingException exception) {
            logger.warn(exception.getMessage(), exception);
        }

        return changes;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Resource> findChangeResource(UUID changeId, UUID resourceId) {
        return this.changeRepository.findById(changeId)
                .flatMap(change -> change.getChangeResources().stream()
                        .filter(changeResource -> resourceId.equals(changeResource.getId()))
                        .findFirst())
                .map(changeResource -> changeResource.getResource().getId())
                .flatMap(this.resourceRepository::findById);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChangeResourceDTO> findChangeResources(UUID changeId) {
        var optionalChange = this.changeRepository.findById(changeId);
        if (optionalChange.isPresent()) {
            var change = optionalChange.get();
            return change.getChangeResources().stream()
                    .flatMap(changeResource -> this.resourceRepository.findById(changeResource.getResource().getId())
                            .map(resource -> new ChangeResourceDTO(changeResource.getId(), resource.getName(), new String(resource.getContent(), StandardCharsets.UTF_8)))
                            .stream())
                    .toList();
        }
        return List.of();
    }
}
