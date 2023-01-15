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

package com.svalyn.studio.application.listeners.history;

import com.svalyn.studio.domain.history.events.ChangeProposalDeletedEvent;
import com.svalyn.studio.domain.history.repositories.IChangeRepository;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

/**
 * Used to delete the change used by a change proposal.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeProposalDeletedEventListener {

    private final IChangeRepository changeRepository;

    private final IResourceRepository resourceRepository;

    private final Logger logger = LoggerFactory.getLogger(ChangeProposalDeletedEventListener.class);

    public ChangeProposalDeletedEventListener(IChangeRepository changeRepository, IResourceRepository resourceRepository) {
        this.changeRepository = Objects.requireNonNull(changeRepository);
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onChangeProposalDeletedEvent(ChangeProposalDeletedEvent event) {
        logger.info(event.toString());
        this.changeRepository.findById(event.changeProposal().getChange().getId()).ifPresent(change -> {
            change.dispose();
            this.changeRepository.delete(change);
        });
    }
}
