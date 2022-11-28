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

export interface AuthenticationTokensSettingsTabProps {}

export interface AuthenticationTokensSettingsTabState {
  page: number;
  rowsPerPage: number;
  selectedAuthenticationTokenIds: string[];
  newAuthenticationTokenDialogOpen: boolean;
  message: string | null;
  errorSnackbarOpen: boolean;
}

export interface GetAuthenticationTokensVariables {
  page: number;
  rowsPerPage: number;
}

export interface GetAuthenticationTokensData {
  viewer: Viewer | null;
}

export interface Viewer {
  authenticationTokens: ViewerAuthenticationTokensConnection;
}

export interface ViewerAuthenticationTokensConnection {
  edges: ViewerAuthenticationTokensEdge[];
  pageInfo: PageInfo;
}

export interface ViewerAuthenticationTokensEdge {
  node: AuthenticationToken;
}

export interface AuthenticationToken {
  id: string;
  name: string;
  status: AuthenticationTokenStatus;
  createdOn: string;
}

export type AuthenticationTokenStatus = 'ACTIVE' | 'INACTIVE';

export interface PageInfo {
  count: number;
}

export interface UpdateAuthenticationTokensStatusVariables {
  input: UpdateAuthenticationTokensStatusInput;
}

export interface UpdateAuthenticationTokensStatusInput {
  id: string;
  authenticationTokenIds: string[];
  status: AuthenticationTokenStatus;
}

export interface UpdateAuthenticationTokensStatusData {
  updateAuthenticationTokensStatus: UpdateAuthenticationTokensStatusPayload;
}

export interface UpdateAuthenticationTokensStatusPayload {
  __typename: string;
}

export interface ErrorPayload extends UpdateAuthenticationTokensStatusPayload {
  __typename: 'ErrorPayload';
  message: string;
}
