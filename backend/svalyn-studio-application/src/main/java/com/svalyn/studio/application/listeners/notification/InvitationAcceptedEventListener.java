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

import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.notification.Notification;
import com.svalyn.studio.domain.notification.repositories.INotificationRepository;
import com.svalyn.studio.domain.organization.Membership;
import com.svalyn.studio.domain.organization.events.InvitationAcceptedEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.Objects;

/**
 * Used to send a notification after an invitation has been accepted.
 *
 * @author sbegaudeau
 */
@Service
public class InvitationAcceptedEventListener {

    private final IAccountRepository accountRepository;

    private final INotificationRepository notificationRepository;

    public InvitationAcceptedEventListener(IAccountRepository accountRepository, INotificationRepository notificationRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.notificationRepository = Objects.requireNonNull(notificationRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onInvitationAcceptedEvent(InvitationAcceptedEvent event) {
        this.accountRepository.findById(event.invitation().getMemberId().getId()).ifPresent(account -> {
            var newMemberNotification = Notification.newNotification()
                    .title("Welcome in the organization " + event.organization().getName())
                    .ownedBy(event.invitation().getMemberId())
                    .relatedUrl("/orgs/" + event.organization().getIdentifier())
                    .build();

            var existingMemberNotifications = event.organization().getMemberships().stream()
                    .map(Membership::getMemberId)
                    .filter(memberId -> !memberId.getId().equals(event.invitation().getMemberId().getId()))
                    .map(memberId -> Notification.newNotification()
                            .title(account.getName() + " has joined the organization " + event.organization().getName())
                            .relatedUrl("/profile/" + account.getUsername())
                            .ownedBy(memberId)
                            .build()
                    ).toList();

            var notifications = new ArrayList<Notification>();
            notifications.add(newMemberNotification);
            notifications.addAll(existingMemberNotifications);

            this.notificationRepository.saveAll(notifications);
        });
    }
}
