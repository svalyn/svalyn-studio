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

package com.svalyn.studio.application.services.organization.api;

import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.organization.dto.CreateOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.DeleteOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.LeaveOrganizationInput;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.RenameOrganizationInput;
import org.springframework.data.domain.Page;

import java.util.Optional;

/**
 * Used to manipulate organizations.
 *
 * @author sbegaudeau
 */
public interface IOrganizationService {

    Page<OrganizationDTO> findAll();

    Optional<OrganizationDTO> findByIdentifier(String identifier);

    IPayload createOrganization(CreateOrganizationInput input);

    IPayload renameOrganization(RenameOrganizationInput input);

    IPayload leaveOrganization(LeaveOrganizationInput input);

    IPayload deleteOrganization(DeleteOrganizationInput input);
}
