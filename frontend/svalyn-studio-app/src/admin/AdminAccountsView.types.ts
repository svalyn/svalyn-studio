/*
 * Copyright (c) 2023 Stéphane Bégaudeau.
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

export interface AccountTableState {
  page: number;
  rowsPerPage: number;
}

export interface GetAccountsData {
  viewer: Viewer;
}

export interface Viewer {
  asAdmin: Admin;
}

export interface Admin {
  accounts: AdminAccountsConnection;
}

export interface AdminAccountsConnection {
  edges: AdminAccountsEdge[];
  pageInfo: PageInfo;
}

export interface PageInfo {
  count: number;
}

export interface AdminAccountsEdge {
  node: Account;
}

export interface Account {
  username: string;
  name: string;
  email: string;
  imageUrl: string;
  role: AccountRole;
  createdOn: string;
  lastModifiedOn: string;
}

export type AccountRole = 'USER' | 'ADMIN';

export interface GetAccountsVariables {
  page: number;
  rowsPerPage: number;
}

export interface AccountRowProps {
  account: Account;
}
