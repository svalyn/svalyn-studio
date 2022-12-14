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
import com.svalyn.studio.application.controllers.organization.dto.AcceptInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.DeclineInvitationInput;
import com.svalyn.studio.application.controllers.organization.dto.InvitationDTO;
import com.svalyn.studio.application.controllers.organization.dto.InviteMemberInput;
import com.svalyn.studio.application.controllers.organization.dto.OrganizationDTO;
import com.svalyn.studio.application.controllers.organization.dto.RevokeInvitationInput;
import org.springframework.data.domain.Page;

/**
 * Used to manipulate invitations.
 *
 * @author sbegaudeau
 */
public interface IInvitationService {

    Page<InvitationDTO> findAll(int page, int rowsPerPage);

    Page<InvitationDTO> findAll(OrganizationDTO organization, int page, int rowsPerPage);

    IPayload inviteMember(InviteMemberInput input);

    IPayload revokeInvitation(RevokeInvitationInput input);

    IPayload acceptInvitation(AcceptInvitationInput input);

    IPayload declineInvitation(DeclineInvitationInput input);
}
