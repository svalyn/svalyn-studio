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

package com.svalyn.studio.application.listeners.notification;

import com.svalyn.studio.domain.account.UserIdProvider;
import com.svalyn.studio.domain.notification.Notification;
import com.svalyn.studio.domain.notification.repositories.INotificationRepository;
import com.svalyn.studio.domain.organization.Membership;
import com.svalyn.studio.domain.organization.repositories.IOrganizationRepository;
import com.svalyn.studio.domain.project.events.ProjectDeletedEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

/**
 * Used to send a notification after a project has been deleted.
 *
 * @author sbegaudeau
 */
@Service
public class ProjectDeletedEventListener {

    private final IOrganizationRepository organizationRepository;

    private final INotificationRepository notificationRepository;

    public ProjectDeletedEventListener(IOrganizationRepository organizationRepository, INotificationRepository notificationRepository) {
        this.organizationRepository = Objects.requireNonNull(organizationRepository);
        this.notificationRepository = Objects.requireNonNull(notificationRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onProjectDeletedEvent(ProjectDeletedEvent event) {
        this.organizationRepository.findById(event.project().getOrganization().getId()).ifPresent(organization -> {
            var notifications = organization.getMemberships().stream()
                    .map(Membership::getMemberId)
                    .filter(memberId -> !UserIdProvider.get().getId().equals(memberId.getId()))
                    .map(memberId -> Notification.newNotification()
                            .title("The project " + event.project().getName() + " has been deleted from the organization " + organization.getName())
                            .ownedBy(memberId)
                            .relatedUrl("/orgs/" + organization.getIdentifier())
                            .build()
                    ).toList();
            this.notificationRepository.saveAll(notifications);
        });
    }
}
