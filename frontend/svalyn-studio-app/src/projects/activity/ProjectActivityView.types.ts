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

export interface GetProjectActivityVariables {
  identifier: string;
}

export interface GetProjectActivityData {
  viewer: Viewer;
}

export interface Viewer {
  project: Project | null;
}

export interface Project {
  activityEntries: ProjectActivityEntriesConnection;
}

export interface ProjectActivityEntriesConnection {
  edges: ProjectActivityEntriesEdge[];
}

export interface ProjectActivityEntriesEdge {
  node: ActivityEntry;
}

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  createdOn: string;
  createdBy: Profile;
}

type ActivityKind =
  | 'ACCOUNT_CREATED'
  | 'ORGANIZATION_CREATED'
  | 'PROJECT_CREATED'
  | 'PROJECT_DELETED'
  | 'CHANGE_PROPOSAL_CREATED'
  | 'CHANGE_PROPOSAL_REVIEWED'
  | 'CHANGE_PROPOSAL_INTEGRATED';

export interface Profile {
  name: string;
  username: string;
  imageUrl: string;
}
