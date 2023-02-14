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

export interface ProfileViewState {
  viewer: Viewer | null;
  message: string | null;
}

export interface GetViewerData {
  viewer: Viewer;
}

export interface Viewer {
  profile: Profile | null;
}

export interface Profile {
  name: string;
  username: string;
  imageUrl: string;
  activityEntries: ProfileActivityEntriesConnection;
}

export interface ProfileActivityEntriesConnection {
  edges: ProfileActivityEntriesEdge[];
}

export interface ProfileActivityEntriesEdge {
  node: ActivityEntry;
}

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  createdOn: string;
  createdBy: ActivityEntryProfile;
}

type ActivityKind =
  | 'ACCOUNT_CREATED'
  | 'ORGANIZATION_CREATED'
  | 'PROJECT_CREATED'
  | 'PROJECT_DELETED'
  | 'CHANGE_PROPOSAL_CREATED'
  | 'CHANGE_PROPOSAL_REVIEWED'
  | 'CHANGE_PROPOSAL_INTEGRATED';

export interface ActivityEntryProfile {
  name: string;
  username: string;
  imageUrl: string;
}
export interface GetViewerVariables {
  username: string;
}
