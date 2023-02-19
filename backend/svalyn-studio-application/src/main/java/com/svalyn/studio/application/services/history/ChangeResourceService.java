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

import com.svalyn.studio.application.controllers.history.dto.ChangeResourceDTO;
import com.svalyn.studio.application.controllers.history.dto.ChangeResourceMetadataDTO;
import com.svalyn.studio.application.services.history.api.IChangeResourceService;
import com.svalyn.studio.domain.history.ChangeResource;
import com.svalyn.studio.domain.history.repositories.IChangeRepository;
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to manipulate change resources.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeResourceService implements IChangeResourceService {

    private final IChangeRepository changeRepository;

    private final IResourceRepository resourceRepository;

    public ChangeResourceService(IChangeRepository changeRepository, IResourceRepository resourceRepository) {
        this.changeRepository = Objects.requireNonNull(changeRepository);
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Resource> findResource(UUID changeId, String path, String name) {
        return this.changeRepository.findById(changeId).flatMap(change -> {
            var resourceIds = change.getChangeResources().stream()
                    .map(ChangeResource::getResource)
                    .map(AggregateReference::getId)
                    .toList();

            return this.resourceRepository.findByResourceIdsAndPathAndName(resourceIds, path, name);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ChangeResourceDTO> findChangeResource(UUID changeId, String path, String name) {
        return this.changeRepository.findById(changeId).flatMap(change -> {
           var resourceIds = change.getChangeResources().stream()
                   .map(ChangeResource::getResource)
                   .map(AggregateReference::getId)
                   .toList();

           return this.resourceRepository.findByResourceIdsAndPathAndName(resourceIds, path, name)
                   .map(resource -> new ChangeResourceDTO(resource.getContentType(), new String(resource.getContent(), StandardCharsets.UTF_8)));
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChangeResourceMetadataDTO> findChangeResources(UUID changeId) {
        var optionalChange = this.changeRepository.findById(changeId);
        if (optionalChange.isPresent()) {
            var change = optionalChange.get();
            return change.getChangeResources().stream()
                    .flatMap(changeResource -> this.resourceRepository.findById(changeResource.getResource().getId())
                            .map(resource -> new ChangeResourceMetadataDTO(changeResource.getId(), resource.getName(), resource.getPath(), resource.getContentType()))
                            .stream())
                    .sorted(this.sortChangeResource())
                    .toList();
        }
        return List.of();
    }

    private Comparator<ChangeResourceMetadataDTO> sortChangeResource() {
        return (resource1, resource2) -> {
            var fullPath1 = resource1.path() + '/' + resource1.name();
            var fullPath2 = resource2.path() + '/' + resource2.name();
            return Comparator.<String>naturalOrder().compare(fullPath1, fullPath2);
        };
    }
}
