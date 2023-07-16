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

export interface NotificationViewState {
  tab: NotificationTab;
  notifications: ViewerNotificationsConnection | null;
  selectedNotifications: string[];
  page: number;
  rowsPerPage: number;
  message: string | null;
}

export type NotificationTab = 'Inbox' | 'Done';

export interface GetNotificationsData {
  viewer: Viewer;
}

export interface Viewer {
  notifications: ViewerNotificationsConnection;
}

export interface ViewerNotificationsConnection {
  edges: ViewerNotificationsEdge[];
  pageInfo: PageInfo;
}

export interface ViewerNotificationsEdge {
  node: Notification;
}

export interface Notification {
  id: string;
  title: string;
  status: NotificationStatus;
  relatedUrl: string;
  createdOn: string;
}

export interface PageInfo {
  count: number;
}

export interface GetNotificationsVariables {
  status: NotificationStatus[];
  page: number;
  rowsPerPage: number;
}

export type NotificationStatus = 'UNREAD' | 'READ' | 'DONE';

export interface UpdateNotificationsStatusVariables {
  input: UpdateNotificationsStatusInput;
}

export interface UpdateNotificationsStatusInput {
  id: string;
  notificationIds: string[];
  status: NotificationStatus;
}

export interface UpdateNotificationsStatusData {
  updateNotificationsStatus: UpdateNotificationsStatusPayload;
}

export interface UpdateNotificationsStatusPayload {
  __typename: string;
}

export interface ErrorPayload extends UpdateNotificationsStatusPayload {
  __typename: 'ErrorPayload';
  message: string;
}
