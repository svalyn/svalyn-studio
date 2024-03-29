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

export interface ProjectBranchCardProps {}

export interface ProjectEmptyBranchCardProps {
  branchName: string;
}

export interface GetProjectBranchesVariables {
  projectIdentifier: string;
  branchName: string;
}

export interface GetProjectBranchesData {
  viewer: Viewer;
}

export interface Viewer {
  project: Project;
}

export interface Project {
  branches: ProjectBranchConnection;
  branch: Branch;
}

export interface ProjectBranchConnection {
  pageInfo: PageInfo;
}

export interface PageInfo {
  count: number;
}

export interface Branch {
  name: string;
  change: Change | null;
}

export interface Change {
  id: string;
  name: string;
  resources: ChangeResourcesConnection;
  lastModifiedOn: string;
  lastModifiedBy: Profile;
}

export interface Profile {
  name: string;
  username: string;
  imageUrl: string;
}

export interface ChangeResourcesConnection {
  edges: [ChangeResourcesEdge];
}

export interface ChangeResourcesEdge {
  node: ChangeResource;
}

export interface ChangeResource {
  path: string;
  name: string;
}
