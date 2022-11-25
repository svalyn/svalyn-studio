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

package com.svalyn.studio.domain.notification.repositories;

import com.svalyn.studio.domain.notification.Notification;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository used to persist and retrieve notifications.
 *
 * @author sbegaudeau
 */
@Repository
public interface INotificationRepository extends PagingAndSortingRepository<Notification, UUID>, ListCrudRepository<Notification, UUID> {
    @Query("""
    SELECT * FROM notification notification
    WHERE notification.id IN (:notificationIds) AND notification.owned_by = :userId
    """)
    List<Notification> findAllById(List<UUID> notificationIds, UUID userId);

    @Query("""
    SELECT * FROM notification notification
    WHERE notification.status IN (:status) AND notification.owned_by = :userId
    ORDER BY notification.created_on DESC
    LIMIT :limit
    OFFSET :offset
    """)
    List<Notification> findAllByStatus(List<String> status, UUID userId, long offset, int limit);

    @Query("""
    SELECT count(*) FROM notification notification
    WHERE notification.status IN (:status) AND notification.owned_by = :userId
    """)
    long countByStatus(List<String> status, UUID userId);
}
