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

package com.svalyn.studio.application.controllers.history;

import com.svalyn.studio.application.services.history.api.IChangeService;
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
public class ChangeResourcesController {

    private final IChangeService changeService;

    public ChangeResourcesController(IChangeService changeService) {
        this.changeService = Objects.requireNonNull(changeService);
    }

    @GetMapping(path = "/{resourceId}")
    public ResponseEntity<Resource> getModel(@PathVariable UUID changeId, @PathVariable UUID resourceId) {
        var optionalResource = this.changeService.findChangeResource(changeId, resourceId);
        if (optionalResource.isPresent()) {
            var downloadableModel = optionalResource.get();

            var contentDisposition = ContentDisposition.builder("attachement")
                    .filename(downloadableModel.getName())
                    .build();

            var httpHeader = new HttpHeaders();
            httpHeader.setContentDisposition(contentDisposition);
            httpHeader.setContentType(MediaType.APPLICATION_XML);
            httpHeader.setContentLength(downloadableModel.getContent().length);

            var resource = new InputStreamResource(new ByteArrayInputStream(downloadableModel.getContent()));
            return new ResponseEntity<>(resource, httpHeader, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, new HttpHeaders(), HttpStatus.NOT_FOUND);
    }
}