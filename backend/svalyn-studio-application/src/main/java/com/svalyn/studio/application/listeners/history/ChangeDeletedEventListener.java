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

import com.svalyn.studio.domain.history.ChangeResource;
import com.svalyn.studio.domain.history.events.ChangeDeletedEvent;
import com.svalyn.studio.domain.resource.Resource;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

/**
 * Used to deleted the resources used by a change.
 *
 * @author sbegaudeau
 */
@Service
public class ChangeDeletedEventListener {
    private final IResourceRepository resourceRepository;

    private final Logger logger = LoggerFactory.getLogger(ChangeDeletedEventListener.class);

    public ChangeDeletedEventListener(IResourceRepository resourceRepository) {
        this.resourceRepository = Objects.requireNonNull(resourceRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onChangeDeletedEvent(ChangeDeletedEvent event) {
        logger.info(event.toString());
        var resourceIds = event.change().getChangeResources().stream()
                .map(ChangeResource::getResource)
                .map(AggregateReference::getId)
                .toList();
        var resources = this.resourceRepository.findAllById(resourceIds);
        resources.forEach(Resource::dispose);
        this.resourceRepository.deleteAll(resources);
    }
}
