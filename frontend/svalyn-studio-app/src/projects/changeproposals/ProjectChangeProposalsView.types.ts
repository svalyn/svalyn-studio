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

export interface ProjectChangeProposalsViewState {
  project: Project | null;
  filter: ChangeProposalStatusFilter;
  selectedChangeProposalIds: string[];
  page: number;
  rowsPerPage: number;
}

export type ChangeProposalStatusFilter = 'OPEN' | 'CLOSED';

export interface GetChangeProposalsData {
  viewer: Viewer;
}

export interface Viewer {
  project: Project | null;
}

export interface Project {
  changeProposals: ProjectChangeProposalsConnection;
}

export interface ProjectChangeProposalsConnection {
  edges: ProjectChangeProposalsEdge[];
  pageInfo: PageInfo;
}

export interface PageInfo {
  count: number;
}

export interface ProjectChangeProposalsEdge {
  node: ChangeProposal;
}

export interface ChangeProposal {
  id: string;
  name: string;
}

export interface GetChangeProposalsVariables {
  identifier: string;
  status: ChangeProposalStatus[];
  page: number;
  rowsPerPage: number;
}

export type ChangeProposalStatus = 'OPEN' | 'CLOSED' | 'INTEGRATED';

export interface DeleteChangeProposalsData {
  deleteChangeProposals: DeleteChangeProposalsPayload;
}

export interface DeleteChangeProposalsPayload {
  __typename: string;
}

export interface ErrorPayload extends DeleteChangeProposalsPayload {
  __typename: 'ErrorPayload';
  message: string;
}

export interface DeleteChangeProposalsVariables {
  input: DeleteChangeProposalsInput;
}

export interface DeleteChangeProposalsInput {
  id: string;
  changeProposalIds: string[];
}
