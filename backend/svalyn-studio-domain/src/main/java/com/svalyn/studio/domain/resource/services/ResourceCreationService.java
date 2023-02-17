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
import com.svalyn.studio.domain.resource.ContentType;
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import com.svalyn.studio.domain.resource.services.api.IResourceCreationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Used to create resources.
 *
 * @author sbegaudeau
 */
@Service
public class ResourceCreationService implements IResourceCreationService {

    private final IResourceRepository resourceRepository;

    private final IMessageService messageService;

    private final Logger logger = LoggerFactory.getLogger(ResourceCreationService.class);

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
                    .flatMap(this::toResources)
                    .toList();
            this.resourceRepository.saveAll(resources);

            result = new Success<>(resources);
        }

        return result;
    }

    private Stream<Resource> toResources(Map.Entry<String, byte[]> entry) {
        Stream<Resource> resources = Stream.empty();

        Path tempFile = null;
        String contentType = null;
        try {
            tempFile = Files.createTempFile("temp", entry.getKey());
            tempFile.toFile().deleteOnExit();

            Files.write(tempFile, entry.getValue());
            contentType = Files.probeContentType(tempFile);
        } catch (IOException exception) {
            this.logger.warn(exception.getMessage(), exception);
        }

        if (tempFile != null) {
            if ("application/zip".equals(contentType)) {
                resources = this.readZipResources(tempFile);
            } else {
                resources = Stream.of(this.toResource("", entry.getKey(), entry.getValue()));
            }
        }
        return resources;
    }

    private Stream<Resource> readZipResources(Path zipFilePath) {
        List<Resource> resources = new ArrayList<>();
        try (var fileSystem = FileSystems.newFileSystem(zipFilePath, Map.of());) {
            for (var rootDirectory : fileSystem.getRootDirectories()) {
                Files.walk(rootDirectory).filter(path -> !Files.isDirectory(path)).forEach(path -> {
                    try {
                        var bytes = Files.readAllBytes(path);
                        var name = path.getFileName().toString();
                        var parentPath = path.getParent().toAbsolutePath().toString();
                        if (parentPath.startsWith("/")) {
                            parentPath = parentPath.substring("/".length());
                        }

                        var resource = this.toResource(parentPath, name, bytes);
                        resources.add(resource);
                    } catch (IOException exception) {
                        this.logger.warn(exception.getMessage(), exception);
                    }
                });
            }
        } catch (IOException exception) {
            this.logger.warn(exception.getMessage(), exception);
        }

        return resources.stream();
    }

    private Resource toResource(String path, String name, byte[] content) {
        var resource = Resource.newResource()
                .name(name)
                .content(content)
                .path(path)
                .contentType(ContentType.TEXT_PLAIN)
                .build();
        return resource;
    }
}
