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

export interface ChangeProposalOverviewProps {
  changeProposalId: string;
  role: MembershipRole;
}

export type MembershipRole = 'ADMIN' | 'MEMBER' | 'NONE';

export interface ChangeProposalOverviewState {
  changeProposal: ChangeProposal | null;
  editReadMeDialogOpen: boolean;
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
  readMe: string;
  status: ChangeProposalStatus;
}

export type ChangeProposalStatus = 'OPEN' | 'CLOSED' | 'INTEGRATED';

export interface GetChangeProposalVariables {
  id: string;
}

export interface UpdateChangeProposalReadMeData {
  updateChangeProposalReadMe: UpdateChangeProposalReadMePayload;
}

export interface UpdateChangeProposalReadMePayload {
  __typename: string;
}

export interface ErrorPayload extends UpdateChangeProposalReadMePayload {
  __typename: 'ErrorPayload';
  message: string;
}

export interface UpdateChangeProposalReadMeVariables {
  input: UpdateChangeProposalReadMeInput;
}

export interface UpdateChangeProposalReadMeInput {
  changeProposalId: string;
  content: string;
}
