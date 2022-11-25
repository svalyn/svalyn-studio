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

package com.svalyn.studio.application.controllers.notification;

import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.controllers.notification.dto.NotificationDTO;
import com.svalyn.studio.application.controllers.notification.dto.UpdateNotificationsStatusInput;
import com.svalyn.studio.application.services.notification.api.INotificationService;
import com.svalyn.studio.domain.notification.NotificationStatus;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultConnectionCursor;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;
import graphql.relay.Relay;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Objects;

/**
 * Controller used to manipulate notifications.
 *
 * @author sbegaudeau
 */
@Controller
public class NotificationController {
    private final INotificationService notificationService;

    public NotificationController(INotificationService notificationService) {
        this.notificationService = Objects.requireNonNull(notificationService);
    }

    @SchemaMapping(typeName = "Viewer")
    public long unreadNotificationsCount() {
        return this.notificationService.unreadNotificationsCount();
    }

    @SchemaMapping(typeName = "Viewer")
    public Connection<NotificationDTO> notifications(@Argument List<NotificationStatus> status, @Argument int page, @Argument int rowsPerPage) {
        var pageData = this.notificationService.findAllByStatus(status, page, rowsPerPage);
        var edges = pageData.stream().map(notification -> {
            var value = new Relay().toGlobalId("Notification", notification.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            Edge<NotificationDTO> edge = new DefaultEdge<>(notification, cursor);
            return edge;
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, false, false, pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @MutationMapping
    public IPayload updateNotificationsStatus(@Argument @Valid UpdateNotificationsStatusInput input) {
        return this.notificationService.updateStatus(input);
    }
}
