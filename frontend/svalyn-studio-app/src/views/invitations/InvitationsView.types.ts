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

export interface InvitationsViewState {
  viewer: Viewer | null;
  page: number;
  rowsPerPage: number;
  message: string | null;
}

export interface GetInvitationsData {
  viewer: Viewer;
}

export interface Viewer {
  invitations: ViewerInvitationsConnection;
}

export interface ViewerInvitationsConnection {
  edges: ViewerInvitationsEdge[];
  pageInfo: PageInfo;
}

export interface PageInfo {
  count: number;
}

export interface ViewerInvitationsEdge {
  node: Invitation;
}

export interface Invitation {
  id: string;
  organization: Organization;
}

export interface Organization {
  identifier: string;
  name: string;
}

export interface GetInvitationsVariables {
  page: number;
  rowsPerPage: number;
}

export interface AcceptInvitationData {
  acceptInvitation: AcceptInvitationPayload;
}

export interface AcceptInvitationPayload {
  __typename: string;
}

export interface AcceptInvitationVariables {
  input: AcceptInvitationInput;
}

export interface AcceptInvitationInput {
  organizationIdentifier: string;
  invitationId: string;
}

export interface DeclineInvitationData {
  declineInvitation: DeclineInvitationPayload;
}

export interface DeclineInvitationPayload {
  __typename: string;
}

export interface DeclineInvitationVariables {
  input: DeclineInvitationInput;
}

export interface DeclineInvitationInput {
  organizationIdentifier: string;
  invitationId: string;
}

export interface ErrorPayload extends AcceptInvitationPayload, DeclineInvitationPayload {
  __typename: 'ErrorPayload';
  message: string;
}
