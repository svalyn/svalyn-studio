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

package com.svalyn.studio.application.controllers.project.dto;

import java.util.Objects;
import java.util.UUID;

/**
 * The project DTO for the GraphQL layer.
 *
 * @param organizationId The id of the organization
 * @param identifier The identifier
 * @param name The name
 * @param description The description
 * @param readMe The READ ME
 *
 * @author sbegaudeau
 */
public record ProjectDTO(UUID organizationId, String identifier, String name, String description, String readMe) {
    public ProjectDTO(UUID organizationId, String identifier, String name, String description, String readMe) {
        this.organizationId = Objects.requireNonNull(organizationId);
        this.identifier = Objects.requireNonNull(identifier);
        this.name = Objects.requireNonNull(name);
        this.description = Objects.requireNonNull(description);
        this.readMe = Objects.requireNonNull(readMe);
    }
}
