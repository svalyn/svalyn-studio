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

export interface ChangeProposalStatusProps {
  changeProposal: ChangeProposal;
  onStatusUpdated: () => void;
}

export interface ChangeProposal {
  id: string;
  readMe: string;
  status: ChangeProposalStatus;
  reviews: ChangeProposalReviewsConnection;
}

export type ChangeProposalStatus = 'OPEN' | 'CLOSED' | 'INTEGRATED';

export interface ChangeProposalReviewsConnection {
  edges: ChangeProposalReviewsEdge[];
}

export interface ChangeProposalReviewsEdge {
  node: Review;
}

export interface Review {
  id: string;
  message: string;
  status: ReviewStatus;
}

export type ReviewStatus = 'APPROVED' | 'REQUESTED_CHANGES';

export interface ChangeProposalStatusState {
  selectedOptionIndex: number;
  reviewDialogOpen: boolean;
  actionButtonOpen: boolean;
}

export interface UpdateChangeProposalStatusData {
  updateChangeProposalStatus: UpdateChangeProposalStatusPayload;
}

export interface UpdateChangeProposalStatusPayload {
  __typename: string;
}

export interface ErrorPayload extends UpdateChangeProposalStatusPayload {
  __typename: 'ErrorPayload';
  message: string;
}

export interface UpdateChangeProposalStatusVariables {
  input: UpdateChangeProposalStatusInput;
}

export interface UpdateChangeProposalStatusInput {
  id: string;
  changeProposalId: string;
  status: ChangeProposalStatus;
}
