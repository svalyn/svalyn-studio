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

package com.svalyn.studio.application.services.changeproposal.api;

import com.svalyn.studio.application.controllers.changeproposal.dto.ChangeProposalDTO;
import com.svalyn.studio.application.controllers.changeproposal.dto.ChangeProposalResourceDTO;
import com.svalyn.studio.application.controllers.changeproposal.dto.CreateChangeProposalInput;
import com.svalyn.studio.application.controllers.changeproposal.dto.DeleteChangeProposalsInput;
import com.svalyn.studio.application.controllers.changeproposal.dto.UpdateChangeProposalReadMeInput;
import com.svalyn.studio.application.controllers.changeproposal.dto.UpdateChangeProposalStatusInput;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.domain.resource.Resource;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Used to manipulate change proposals.
 *
 * @author sbegaudeau
 */
public interface IChangeProposalService {
    Page<ChangeProposalDTO> findAllByProjectId(UUID projectId, int page, int rowsPerPage);

    IPayload createChangeProposal(CreateChangeProposalInput input);

    Optional<ChangeProposalDTO> findById(UUID id);

    Optional<Resource> findChangeProposalResource(UUID changeProposalId, UUID resourceId);

    List<ChangeProposalResourceDTO> findChangeProposalResources(UUID changeProposalId);

    IPayload updateChangeProposalReadMe(UpdateChangeProposalReadMeInput input);

    IPayload updateChangeProposalStatus(UpdateChangeProposalStatusInput input);

    IPayload deleteChangeProposals(DeleteChangeProposalsInput input);
}
