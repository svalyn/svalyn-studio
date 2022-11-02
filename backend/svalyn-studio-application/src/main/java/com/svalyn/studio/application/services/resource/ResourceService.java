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

package com.svalyn.studio.application.services.resource;

import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.resource.dto.CreateResourcesSuccessPayload;
import com.svalyn.studio.application.services.resource.api.IResourceService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.services.api.IResourceCreationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to manipulate resources.
 *
 * @author sbegaudeau
 */
@Service
public class ResourceService implements IResourceService {

    private final IResourceCreationService resourceCreationService;

    private final Logger logger = LoggerFactory.getLogger(ResourceService.class);

    public ResourceService(IResourceCreationService resourceCreationService) {
        this.resourceCreationService = Objects.requireNonNull(resourceCreationService);
    }

    @Override
    @Transactional
    public IPayload createResources(MultipartFile[] multipartFiles) {
        Map<String, byte[]> resourceDescriptions = new HashMap<>();
        for (var multipartFile: multipartFiles) {
            try {
                resourceDescriptions.put(multipartFile.getOriginalFilename(), multipartFile.getBytes());
            } catch (IOException exception) {
                this.logger.warn(exception.getMessage());
            }
        }

        IPayload payload = null;
        var result = this.resourceCreationService.createResources(resourceDescriptions);
        if (result instanceof Failure<List<Resource>> failure) {
            payload = new ErrorPayload(UUID.randomUUID(), failure.message());
        } else if (result instanceof Success<List<Resource>> success) {
            var resourceIds = success.data().stream().map(Resource::getId).toList();
            payload = new CreateResourcesSuccessPayload(UUID.randomUUID(), resourceIds);
        }

        return payload;
    }
}
