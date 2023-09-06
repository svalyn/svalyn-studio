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

package com.svalyn.studio.application.listeners.activity;

import com.svalyn.studio.domain.account.events.AccountDeletedEvent;
import com.svalyn.studio.domain.activity.repositories.IActivityEntryRepository;
import com.svalyn.studio.domain.activity.repositories.IOrganizationActivityEntryRepository;
import com.svalyn.studio.domain.activity.repositories.IProjectActivityEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

/**
 * Used to delete account activities.
 *
 * @author sbegaudeau
 */
@Service
public class ActivityCleanerOnAccountDeletedEvent {

    private final IActivityEntryRepository activityEntryRepository;

    private final IOrganizationActivityEntryRepository organizationActivityEntryRepository;

    private final IProjectActivityEntryRepository projectActivityEntryRepository;

    private final Logger logger = LoggerFactory.getLogger(ActivityCleanerOnAccountDeletedEvent.class);

    public ActivityCleanerOnAccountDeletedEvent(IActivityEntryRepository activityEntryRepository, IOrganizationActivityEntryRepository organizationActivityEntryRepository, IProjectActivityEntryRepository projectActivityEntryRepository) {
        this.activityEntryRepository = Objects.requireNonNull(activityEntryRepository);
        this.organizationActivityEntryRepository = Objects.requireNonNull(organizationActivityEntryRepository);
        this.projectActivityEntryRepository = Objects.requireNonNull(projectActivityEntryRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onAccountDeletedEvent(AccountDeletedEvent event) {
        logger.info(event.toString());
        this.organizationActivityEntryRepository.deleteAllByUserId(event.account().getId());
        this.projectActivityEntryRepository.deleteAllByUserId(event.account().getId());
        this.activityEntryRepository.deleteAllByUserId(event.account().getId());
    }
}
