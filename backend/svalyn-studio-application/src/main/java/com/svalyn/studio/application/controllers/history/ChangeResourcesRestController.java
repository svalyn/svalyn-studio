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

package com.svalyn.studio.application.controllers.history;

import com.svalyn.studio.application.services.history.api.IChangeResourceService;
import com.svalyn.studio.domain.resource.ContentType;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.ByteArrayInputStream;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to manipulate the change resources.
 *
 * @author sbegaudeau
 */
@Controller
@RequestMapping("/api/changes/{changeId}/resources")
public class ChangeResourcesRestController {

    private final IChangeResourceService changeResourceService;

    public ChangeResourcesRestController(IChangeResourceService changeResourceService) {
        this.changeResourceService = Objects.requireNonNull(changeResourceService);
    }

    @GetMapping(path = "/{*fullPath}")
    public ResponseEntity<Resource> getModel(@PathVariable UUID changeId, @PathVariable String fullPath) {
        var path = "";
        var name = fullPath;
        var lastSlashIndex = fullPath.lastIndexOf("/");
        if (lastSlashIndex != -1 && lastSlashIndex != fullPath.length() - 1) {
            name = fullPath.substring(lastSlashIndex + "/".length());
            path = fullPath.substring(0, lastSlashIndex);
            if (path.startsWith("/")) {
                path = path.substring("/".length());
            }
        }

        var optionalResource = this.changeResourceService.findResource(changeId, path, name);
        if (optionalResource.isPresent()) {
            var resource = optionalResource.get();

            var contentDisposition = ContentDisposition.builder("attachement")
                    .filename(resource.getName())
                    .build();

            var httpHeader = new HttpHeaders();
            httpHeader.setContentDisposition(contentDisposition);
            if (resource.getContentType().equals(ContentType.TEXT_PLAIN)) {
                httpHeader.setContentType(MediaType.TEXT_PLAIN);
            }
            httpHeader.setContentLength(resource.getContent().length);

            var inputStreamResource = new InputStreamResource(new ByteArrayInputStream(resource.getContent()));
            return new ResponseEntity<>(inputStreamResource, httpHeader, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, new HttpHeaders(), HttpStatus.NOT_FOUND);
    }
}