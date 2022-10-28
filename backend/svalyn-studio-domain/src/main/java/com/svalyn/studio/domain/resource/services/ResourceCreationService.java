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

package com.svalyn.studio.domain.resource.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.message.api.IMessageService;
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import com.svalyn.studio.domain.resource.services.api.IResourceCreationService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Used to create resources.
 *
 * @author sbegaudeau
 */
@Service
public class ResourceCreationService implements IResourceCreationService {

    private final IResourceRepository resourceRepository;

    private final IMessageService messageService;

    public ResourceCreationService(IResourceRepository resourceRepository, IMessageService messageService) {
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
        this.messageService = Objects.requireNonNull(messageService);
    }

    @Override
    public IResult<List<Resource>> createResources(Map<String, byte[]> resourceDescriptions) {
        IResult<List<Resource>> result = null;

        var hasBlankName = resourceDescriptions.keySet().stream().anyMatch(String::isBlank);
        var hasBlankResource = resourceDescriptions.values().stream().anyMatch(content -> content.length == 0);
        if (hasBlankName) {
            result = new Failure<>(this.messageService.cannotBeBlank("name"));
        } else if (hasBlankResource) {
            result = new Failure<>(this.messageService.cannotBeBlank("resource"));
        } else if (resourceDescriptions.isEmpty()) {
            result = new Failure<>(this.messageService.cannotBeEmpty("resources"));
        } else {
            var resources = resourceDescriptions.entrySet().stream()
                    .map(entry -> Resource.newResource()
                            .name(entry.getKey())
                            .content(entry.getValue())
                            .build())
                    .toList();
            this.resourceRepository.saveAll(resources);

            result = new Success<>(resources);
        }

        return result;
    }
}
