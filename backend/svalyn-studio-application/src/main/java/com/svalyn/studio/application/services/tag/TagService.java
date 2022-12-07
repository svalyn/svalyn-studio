/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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

package com.svalyn.studio.application.services.tag;

import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.SuccessPayload;
import com.svalyn.studio.application.controllers.tag.dto.AddTagToOrganizationInput;
import com.svalyn.studio.application.controllers.tag.dto.AddTagToProjectInput;
import com.svalyn.studio.application.controllers.tag.dto.TagDTO;
import com.svalyn.studio.application.services.tag.api.ITagService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.tag.Tag;
import com.svalyn.studio.domain.tag.repositories.ITagRepository;
import com.svalyn.studio.domain.tag.services.api.ITagCreationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

/**
 * Used to manipulate tags.
 *
 * @author sbegaudeau
 */
@Service
public class TagService implements ITagService {

    private final ITagRepository tagRepository;

    private final ITagCreationService tagCreationService;

    public TagService(ITagRepository tagRepository, ITagCreationService tagCreationService) {
        this.tagRepository = Objects.requireNonNull(tagRepository);
        this.tagCreationService = Objects.requireNonNull(tagCreationService);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TagDTO> findAllByOrganizationId(UUID organizationId, int page, int rowsPerPage) {
        var tags = this.tagRepository.findAllByOrganizationId(organizationId, page * rowsPerPage, rowsPerPage).stream()
                .map(tag -> new TagDTO(tag.getId(), tag.getKey(), tag.getValue()))
                .toList();
        var count = this.tagRepository.countAllByOrganizationId(organizationId);
        return new PageImpl<>(tags, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional
    public IPayload addTagToOrganization(AddTagToOrganizationInput input) {
        IPayload payload = null;

        var result = this.tagCreationService.addOrganizationTag(input.organizationIdentifier(), input.key(), input.value());
        if (result instanceof Failure<Tag> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Tag> success) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TagDTO> findAllByProjectId(UUID projectId, int page, int rowsPerPage) {
        var tags = this.tagRepository.findAllByProjectId(projectId, page * rowsPerPage, rowsPerPage).stream()
                .map(tag -> new TagDTO(tag.getId(), tag.getKey(), tag.getValue()))
                .toList();
        var count = this.tagRepository.countAllByProjectId(projectId);
        return new PageImpl<>(tags, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional
    public IPayload addTagToProject(AddTagToProjectInput input) {
        IPayload payload = null;

        var result = this.tagCreationService.addProjectTag(input.projectIdentifier(), input.key(), input.value());
        if (result instanceof Failure<Tag> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Tag> success) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }
}
