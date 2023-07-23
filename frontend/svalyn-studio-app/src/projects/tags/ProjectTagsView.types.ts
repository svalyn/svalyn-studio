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

export interface ProjectTagsViewState {
  key: string;
  value: string;
  page: number;
  rowsPerPage: number;
  message: string | null;
}

export interface GetProjectTagsVariables {
  identifier: string;
  page: number;
  rowsPerPage: number;
}

export interface GetProjectTagsData {
  viewer: Viewer | null;
}

export interface Viewer {
  project: Project | null;
}

export interface Project {
  tags: ProjectTagsConnection;
}

export interface ProjectTagsConnection {
  edges: ProjectTagsEdge[];
  pageInfo: PageInfo;
}

export interface ProjectTagsEdge {
  node: Tag;
}

export interface Tag {
  id: string;
  key: string;
  value: string;
}

export interface PageInfo {
  count: number;
}

export interface AddTagToProjectVariables {
  input: AddTagToProjectInput;
}

export interface AddTagToProjectInput {
  id: string;
  projectIdentifier: string;
  key: string;
  value: string;
}

export interface AddTagToProjectData {
  addTagToProject: AddTagToProjectPayload;
}

export interface AddTagToProjectPayload {
  __typename: string;
}

export interface ErrorPayload extends AddTagToProjectPayload {
  __typename: 'ErrorPayload';
  message: string;
}
