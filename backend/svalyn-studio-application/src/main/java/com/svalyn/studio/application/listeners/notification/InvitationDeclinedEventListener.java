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
import com.svalyn.studio.domain.organization.events.InvitationDeclinedEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

/**
 * Used to send a notification after an invitation has been declined.
 *
 * @author sbegaudeau
 */
@Service
public class InvitationDeclinedEventListener {

    private final IAccountRepository accountRepository;

    private final INotificationRepository notificationRepository;

    public InvitationDeclinedEventListener(IAccountRepository accountRepository, INotificationRepository notificationRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.notificationRepository = Objects.requireNonNull(notificationRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onInvitationDeclinedEvent(InvitationDeclinedEvent event) {
        this.accountRepository.findById(event.invitation().getMemberId().getId()).ifPresent(account -> {
            var notification = Notification.newNotification()
                    .title(account.getName() + " has declined your invitation to join the organization " + event.organization().getName())
                    .ownedBy(event.invitation().getCreatedBy())
                    .relatedUrl("/profile/" + account.getUsername())
                    .build();
            this.notificationRepository.save(notification);
        });
    }
}
