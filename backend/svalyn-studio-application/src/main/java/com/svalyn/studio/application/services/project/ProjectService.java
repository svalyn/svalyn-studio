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

package com.svalyn.studio.application.services.project;

import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.controllers.dto.SuccessPayload;
import com.svalyn.studio.application.controllers.project.dto.CreateProjectInput;
import com.svalyn.studio.application.controllers.project.dto.CreateProjectSuccessPayload;
import com.svalyn.studio.application.controllers.project.dto.DeleteProjectInput;
import com.svalyn.studio.application.controllers.project.dto.ProjectDTO;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectDescriptionInput;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectNameInput;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectReadMeInput;
import com.svalyn.studio.application.services.account.api.IAvatarUrlService;
import com.svalyn.studio.application.services.project.api.IProjectService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import com.svalyn.studio.domain.project.services.api.IProjectCreationService;
import com.svalyn.studio.domain.project.services.api.IProjectDeletionService;
import com.svalyn.studio.domain.project.services.api.IProjectUpdateService;
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
 * Used to manipulate projects.
 *
 * @author sbegaudeau
 */
@Service
public class ProjectService implements IProjectService {

    private final IAccountRepository accountRepository;

    private final IProjectRepository projectRepository;

    private final IProjectCreationService projectCreationService;

    private final IProjectUpdateService projectUpdateService;

    private final IProjectDeletionService projectDeletionService;

    private final IAvatarUrlService avatarUrlService;

    public ProjectService(IAccountRepository accountRepository, IProjectRepository projectRepository, IProjectCreationService projectCreationService, IProjectUpdateService projectUpdateService, IProjectDeletionService projectDeletionService, IAvatarUrlService avatarUrlService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.projectCreationService = Objects.requireNonNull(projectCreationService);
        this.projectUpdateService = Objects.requireNonNull(projectUpdateService);
        this.projectDeletionService = Objects.requireNonNull(projectDeletionService);
        this.avatarUrlService = Objects.requireNonNull(avatarUrlService);
    }

    private Optional<ProjectDTO> toDTO(Project project) {
        var optionalCreatedByProfile = this.accountRepository.findById(project.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(project.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));

        return optionalCreatedByProfile.flatMap(createdBy ->
                optionalLastModifiedByProfile.map(lastModifiedBy ->
                        new ProjectDTO(
                                project.getOrganization().getId(),
                                project.getId(),
                                project.getIdentifier(),
                                project.getName(),
                                project.getDescription(),
                                project.getReadMe(),
                                project.getCreatedOn(),
                                createdBy,
                                project.getLastModifiedOn(),
                                lastModifiedBy
                        )
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectDTO> findAllByOrganizationId(UUID organizationId, int page, int rowsPerPage) {
        var projects = this.projectRepository.findAllByOrganizationId(organizationId, page * rowsPerPage, rowsPerPage).stream()
                .flatMap(project -> this.toDTO(project).stream())
                .toList();
        var count = this.projectRepository.countAllByOrganizationId(organizationId);
        return new PageImpl<>(projects, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProjectDTO> findById(UUID projectId) {
        return this.projectRepository.findById(projectId).flatMap(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProjectDTO> findByIdentifier(String identifier) {
        return this.projectRepository.findByIdentifier(identifier).flatMap(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDTO> searchAllMatching(String query) {
        return this.projectRepository.searchAllMatching(query, 0, 20).stream()
                .flatMap(project -> this.toDTO(project).stream())
                .toList();
    }

    @Override
    @Transactional
    public IPayload createProject(CreateProjectInput input) {
        var result = this.projectCreationService.createProject(input.organizationIdentifier(), input.identifier(), input.name(), input.description());
        return switch (result) {
            case Failure<Project> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Project> success -> new CreateProjectSuccessPayload(input.id(), this.toDTO(success.data()).orElse(null));
        };
    }

    @Override
    @Transactional
    public IPayload updateProjectName(UpdateProjectNameInput input) {
        var result = this.projectUpdateService.updateName(input.projectIdentifier(), input.name());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload updateProjectDescription(UpdateProjectDescriptionInput input) {
        var result = this.projectUpdateService.updateDescription(input.projectIdentifier(), input.description());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload updateProjectReadMe(UpdateProjectReadMeInput input) {
        var result = this.projectUpdateService.updateReadMe(input.projectIdentifier(), input.content());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }

    @Override
    @Transactional
    public IPayload deleteProject(DeleteProjectInput input) {
        var result = this.projectDeletionService.deleteProject(input.projectIdentifier());
        return switch (result) {
            case Failure<Void> failure -> new ErrorPayload(input.id(), failure.message());
            case Success<Void> success -> new SuccessPayload(input.id());
        };
    }
}
