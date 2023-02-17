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

export interface ChangeProposalFilesProps {
  changeProposalId: string;
  role: MembershipRole;
}

export type MembershipRole = 'ADMIN' | 'MEMBER' | 'NONE';

export interface ChangeProposalFilesState {
  changeProposal: ChangeProposal | null;
  message: string | null;
}

export interface GetChangeProposalData {
  viewer: Viewer;
}

export interface Viewer {
  changeProposal: ChangeProposal | null;
}

export interface ChangeProposal {
  id: string;
  name: string;
  status: ChangeProposalStatus;
  change: Change;
}

export type ChangeProposalStatus = 'OPEN' | 'CLOSED' | 'INTEGRATED';

export interface Change {
  resources: ChangeResourcesConnection;
}
export interface ChangeResourcesConnection {
  edges: ChangeResourcesEdge[];
}

export interface ChangeResourcesEdge {
  node: Resource;
}

export interface Resource {
  id: string;
  name: string;
  path: string;
  contentType: ContentType;
  content: string;
}

type ContentType = 'TEXT_PLAIN' | 'UNKNOWN';

export interface GetChangeProposalVariables {
  id: string;
}
