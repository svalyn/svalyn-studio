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

export interface InvitationsProps {
  organizationIdentifier: string;
}

export interface InvitationsState {
  organization: Organization | null;
  message: string | null;
}

export interface Organization {
  invitations: OrganizationInvitationsConnection;
}

export interface OrganizationInvitationsConnection {
  edges: OrganizationInvitationsEdge[];
}

export interface OrganizationInvitationsEdge {
  node: Invitation;
}

export interface Invitation {
  id: string;
  member: Profile;
}

export interface Profile {
  name: string;
  imageUrl: string;
}

export interface GetOrganizationInvitationsData {
  viewer: Viewer;
}

export interface Viewer {
  organization: Organization | null;
}

export interface GetOrganizationInvitationsVariables {
  identifier: string;
}

export interface RevokeInvitationData {
  revokeInvitation: RevokeInvitationPayload;
}

export interface RevokeInvitationPayload {
  __typename: string;
}

export interface ErrorPayload extends RevokeInvitationPayload {
  __typename: 'ErrorPayload';
  message: string;
}

export interface RevokeInvitationVariables {
  input: RevokeInvitationInput;
}

export interface RevokeInvitationInput {
  organizationIdentifier: string;
  invitationId: string;
}
