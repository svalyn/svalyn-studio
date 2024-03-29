/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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

export interface MembershipsProps {
  organizationIdentifier: string;
  role: MembershipRole;
}

export type MembershipRole = 'ADMIN' | 'MEMBER' | 'NONE';

export interface MembershipsState {
  organization: Organization | null;
  selectedMembershipIds: string[];
  page: number;
  rowsPerPage: number;
}

export interface Organization {
  memberships: OrganizationMembershipsConnection;
}

export interface OrganizationMembershipsConnection {
  edges: OrganizationMembershipsEdge[];
  pageInfo: PageInfo;
}

export interface PageInfo {
  count: number;
}

export interface OrganizationMembershipsEdge {
  node: Membership;
}

export interface Membership {
  id: string;
  member: Profile;
}

export interface Profile {
  name: string;
  imageUrl: string;
}

export interface GetOrganizationMembershipsData {
  viewer: Viewer;
}

export interface Viewer {
  organization: Organization | null;
}

export interface GetOrganizationMembershipsVariables {
  identifier: string;
  page: number;
  rowsPerPage: number;
}

export interface RevokeMembershipsData {
  revokeMemberships: RevokeMembershipsPayload;
}

export interface RevokeMembershipsPayload {
  __typename: string;
}

export interface ErrorPayload extends RevokeMembershipsPayload {
  __typename: 'ErrorPayload';
  message: string;
}

export interface RevokeMembershipsVariables {
  input: RevokeMembershipsInput;
}

export interface RevokeMembershipsInput {
  id: string;
  organizationIdentifier: string;
  membershipIds: string[];
}
