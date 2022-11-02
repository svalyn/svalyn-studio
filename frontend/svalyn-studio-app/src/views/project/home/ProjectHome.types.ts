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

export interface ProjectHomeProps {
  projectIdentifier: string;
  role: MembershipRole;
}

export type MembershipRole = 'ADMIN' | 'MEMBER' | 'NONE';

export interface ProjectHomeState {
  project: Project | null;
  editReadMeDialogOpen: boolean;
  message: string | null;
}

export interface GetProjectHomeData {
  viewer: Viewer;
}

export interface Viewer {
  project: Project | null;
}

export interface Project {
  name: string;
  description: string;
  readMe: string;
  organization: Organization;
}

export interface Organization {
  identifier: string;
  name: string;
}

export interface GetProjectHomeVariables {
  identifier: string;
}

export interface UpdateProjectReadMeData {
  updateProjectReadMe: UpdateProjectReadMePayload;
}

export interface UpdateProjectReadMePayload {
  __typename: string;
}

export interface ErrorPayload extends UpdateProjectReadMePayload {
  __typename: 'ErrorPayload';
  message: string;
}

export interface UpdateProjectReadMeVariables {
  input: UpdateProjectReadMeInput;
}

export interface UpdateProjectReadMeInput {
  id: string;
  projectIdentifier: string;
  content: string;
}
