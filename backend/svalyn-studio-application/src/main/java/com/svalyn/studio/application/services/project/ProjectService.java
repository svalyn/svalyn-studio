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
import com.svalyn.studio.application.controllers.project.dto.CreateProjectInput;
import com.svalyn.studio.application.controllers.project.dto.CreateProjectSuccessPayload;
import com.svalyn.studio.application.controllers.project.dto.DeleteProjectInput;
import com.svalyn.studio.application.controllers.project.dto.DeleteProjectSuccessPayload;
import com.svalyn.studio.application.controllers.project.dto.ProjectDTO;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectDescriptionInput;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectDescriptionSuccessPayload;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectNameInput;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectNameSuccessPayload;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectReadMeInput;
import com.svalyn.studio.application.controllers.project.dto.UpdateProjectReadMeSuccessPayload;
import com.svalyn.studio.application.services.project.api.IProjectService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.project.Project;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import com.svalyn.studio.domain.project.services.api.IProjectCreationService;
import com.svalyn.studio.domain.project.services.api.IProjectDeletionService;
import com.svalyn.studio.domain.project.services.api.IProjectUpdateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final IProjectRepository projectRepository;

    private final IProjectCreationService projectCreationService;

    private final IProjectUpdateService projectUpdateService;

    private final IProjectDeletionService projectDeletionService;

    public ProjectService(IProjectRepository projectRepository, IProjectCreationService projectCreationService, IProjectUpdateService projectUpdateService, IProjectDeletionService projectDeletionService) {
        this.projectRepository = Objects.requireNonNull(projectRepository);
        this.projectCreationService = Objects.requireNonNull(projectCreationService);
        this.projectUpdateService = Objects.requireNonNull(projectUpdateService);
        this.projectDeletionService = Objects.requireNonNull(projectDeletionService);
    }

    @Override
    public Page<ProjectDTO> findAllByOrganizationId(UUID organizationId, int page, int rowsPerPage) {
        return this.projectRepository.findAll(PageRequest.of(page, rowsPerPage, Sort.by(Sort.Direction.DESC, "createdOn")))
                .map(project -> new ProjectDTO(project.getOrganization().getId(), project.getIdentifier(), project.getName(), project.getDescription(), project.getReadMe()));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProjectDTO> findByIdentifier(String identifier) {
        return this.projectRepository.findByIdentifier(identifier).map(project -> new ProjectDTO(project.getOrganization().getId(), project.getIdentifier(), project.getName(), project.getDescription(), project.getReadMe()));
    }

    @Override
    @Transactional
    public IPayload createProject(CreateProjectInput input) {
        IPayload payload = null;

        var result = this.projectCreationService.createProject(input.organizationIdentifier(), input.identifier(), input.name(), input.description());
        if (result instanceof Failure<Project> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Project> success) {
            payload = new CreateProjectSuccessPayload(new ProjectDTO(success.data().getOrganization().getId(), success.data().getIdentifier(), success.data().getName(), success.data().getDescription(), success.data().getReadMe()));
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload updateProjectName(UpdateProjectNameInput input) {
        IPayload payload = null;

        var result = this.projectUpdateService.updateName(input.projectIdentifier(), input.name());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new UpdateProjectNameSuccessPayload(UUID.randomUUID());
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload updateProjectDescription(UpdateProjectDescriptionInput input) {
        IPayload payload = null;

        var result = this.projectUpdateService.updateDescription(input.projectIdentifier(), input.description());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new UpdateProjectDescriptionSuccessPayload(UUID.randomUUID());
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload updateProjectReadMe(UpdateProjectReadMeInput input) {
        IPayload payload = null;

        var result = this.projectUpdateService.updateReadMe(input.projectIdentifier(), input.content());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new UpdateProjectReadMeSuccessPayload(UUID.randomUUID());
        }

        return payload;
    }

    @Override
    @Transactional
    public IPayload deleteProject(DeleteProjectInput input) {
        IPayload payload = null;

        var result = this.projectDeletionService.deleteProject(input.projectIdentifier());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(failure.message());
        } else if (result instanceof Success<Void> success) {
            payload = new DeleteProjectSuccessPayload(UUID.randomUUID());
        }

        return payload;
    }
}
