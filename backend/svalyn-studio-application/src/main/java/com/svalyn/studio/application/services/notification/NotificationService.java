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

package com.svalyn.studio.application.services.notification;

import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.ProfileDTO;
import com.svalyn.studio.application.controllers.dto.SuccessPayload;
import com.svalyn.studio.application.controllers.notification.dto.NotificationDTO;
import com.svalyn.studio.application.controllers.notification.dto.UpdateNotificationsStatusInput;
import com.svalyn.studio.application.services.account.api.IAvatarUrlService;
import com.svalyn.studio.application.services.notification.api.INotificationService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.notification.Notification;
import com.svalyn.studio.domain.notification.NotificationStatus;
import com.svalyn.studio.domain.notification.repositories.INotificationRepository;
import com.svalyn.studio.domain.notification.services.api.INotificationUpdateService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Used to manipulate notifications.
 *
 * @author sbegaudeau
 */
@Service
public class NotificationService implements INotificationService {

    private final IAccountRepository accountRepository;

    private final INotificationRepository notificationRepository;

    private final IAvatarUrlService avatarUrlService;

    private final INotificationUpdateService notificationUpdateService;

    public NotificationService(IAccountRepository accountRepository, INotificationRepository notificationRepository, IAvatarUrlService avatarUrlService, INotificationUpdateService notificationUpdateService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.notificationRepository = Objects.requireNonNull(notificationRepository);
        this.avatarUrlService = Objects.requireNonNull(avatarUrlService);
        this.notificationUpdateService = Objects.requireNonNull(notificationUpdateService);
    }

    private Optional<NotificationDTO> toDTO(Notification notification) {
        var optionalOwnedByProfile = this.accountRepository.findById(notification.getOwnedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));
        var optionalCreatedByProfile = this.accountRepository.findById(notification.getCreatedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));
        var optionalLastModifiedByProfile = this.accountRepository.findById(notification.getLastModifiedBy().getId())
                .map(account -> new ProfileDTO(account.getName(), account.getUsername(), this.avatarUrlService.imageUrl(account.getUsername()), account.getCreatedOn()));

        return optionalOwnedByProfile.flatMap(ownedBy ->
                optionalCreatedByProfile.flatMap(createdBy ->
                        optionalLastModifiedByProfile.map(lastModifiedBy ->
                                new NotificationDTO(
                                        notification.getId(),
                                        notification.getTitle(),
                                        notification.getStatus(),
                                        notification.getRelatedUrl(),
                                        notification.getCreatedOn(),
                                        createdBy,
                                        notification.getLastModifiedOn(),
                                        lastModifiedBy
                                )
                        )
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadNotificationsCount() {
        return this.notificationRepository.countByStatus(List.of(NotificationStatus.UNREAD.toString()), UserIdProvider.get().getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDTO> findAllByStatus(List<NotificationStatus> status, int page, int rowsPerPage) {
        var statusString = status.stream().map(Objects::toString).toList();
        var userId = UserIdProvider.get().getId();
        var count = this.notificationRepository.countByStatus(statusString, userId);
        var notifications = this.notificationRepository.findAllByStatus(statusString, userId, page * rowsPerPage, rowsPerPage).stream()
                .flatMap(notification -> this.toDTO(notification).stream())
                .toList();
        return new PageImpl<>(notifications, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional
    public IPayload updateStatus(UpdateNotificationsStatusInput input) {
        IPayload payload = null;

        var result = this.notificationUpdateService.updateStatus(input.notificationIds(), input.status());
        if (result instanceof Failure<Void> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Void>) {
            payload = new SuccessPayload(input.id());
        }

        return payload;
    }
}
