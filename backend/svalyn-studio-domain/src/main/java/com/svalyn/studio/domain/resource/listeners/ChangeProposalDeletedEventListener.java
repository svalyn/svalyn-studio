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

package com.svalyn.studio.domain.resource.listeners;

import com.svalyn.studio.domain.changeproposal.ChangeProposalResource;
import com.svalyn.studio.domain.changeproposal.events.ChangeProposalDeletedEvent;
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

/**
 * Used to delete the resources used by a change proposal.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeProposalDeletedEventListener {
    private final IResourceRepository resourceRepository;

    public ChangeProposalDeletedEventListener(IResourceRepository resourceRepository) {
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onChangeProposalDeletedEvent(ChangeProposalDeletedEvent event) {
        var resourceIds = event.changeProposal().getChangeProposalResources().stream()
                .map(ChangeProposalResource::getResource)
                .map(AggregateReference::getId)
                .toList();
        var resources = this.resourceRepository.findAllById(resourceIds);
        resources.forEach(Resource::dispose);
        this.resourceRepository.deleteAll(resources);
    }
}
