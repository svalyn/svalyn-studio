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
package com.svalyn.studio.application.controllers.search;

import com.svalyn.studio.application.controllers.search.dto.SearchResultsDTO;
import com.svalyn.studio.application.services.organization.api.IOrganizationService;
import com.svalyn.studio.application.services.project.api.IProjectService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.Objects;

/**
 * Controller used to perform searches.
 *
 * @author sbegaudeau
 */
@Controller
public class SearchController {
    private final IOrganizationService organizationService;

    private final IProjectService projectService;

    public SearchController(IOrganizationService organizationService, IProjectService projectService) {
        this.organizationService = Objects.requireNonNull(organizationService);
        this.projectService = Objects.requireNonNull(projectService);
    }

    @SchemaMapping(typeName = "Viewer")
    public SearchResultsDTO search(@Argument String query) {
        var organizations = this.organizationService.searchAllMatching(query);
        var projects = this.projectService.searchAllMatching(query);
        return new SearchResultsDTO(organizations, projects);
    }
}
