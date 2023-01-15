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

package com.svalyn.studio.application.listeners.history;

import com.svalyn.studio.domain.history.Change;
import com.svalyn.studio.domain.history.ChangeResource;
import com.svalyn.studio.domain.history.events.ChangeProposalIntegratedEvent;
import com.svalyn.studio.domain.history.repositories.IBranchRepository;
import com.svalyn.studio.domain.history.repositories.IChangeRepository;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.LinkedHashSet;
import java.util.Objects;

/**
 * Used to integrate changes from a change proposal into a project.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeProposalIntegratedEventListener {

    private final IBranchRepository branchRepository;

    private final IChangeRepository changeRepository;

    public ChangeProposalIntegratedEventListener(IBranchRepository branchRepository, IChangeRepository changeRepository) {
        this.branchRepository = Objects.requireNonNull(branchRepository);
        this.changeRepository = Objects.requireNonNull(changeRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onChangeProposalIntegratedEvent(ChangeProposalIntegratedEvent event) {
        this.branchRepository.findByProjectIdAndName(event.changeProposal().getProject().getId(), "main").ifPresent(branch -> {
            this.changeRepository.findById(event.changeProposal().getChange().getId()).ifPresent(change -> {
                var changeResources = change.getChangeResources().stream()
                        .map(changeResource -> ChangeResource.newChangeResource()
                                .resource(changeResource.getResource())
                                .build())
                        .toList();
                var newChange = Change.newChange()
                        .name(change.getName())
                        .changeResources(new LinkedHashSet<>(changeResources))
                        .parent(branch.getChange())
                        .build();
                this.changeRepository.save(newChange);

                branch.updateChange(AggregateReference.to(newChange.getId()));
                this.branchRepository.save(branch);
            });
        });
    }
}
