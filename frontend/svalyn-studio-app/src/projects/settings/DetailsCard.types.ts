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

export interface DetailsCardProps {}

export interface NameFormProps {}

export interface NameFormData {
  name: string;
}

export interface UpdateProjectNameData {
  updateProjectName: UpdateProjectNamePayload;
}

export interface UpdateProjectNamePayload {
  __typename: string;
}

export interface UpdateProjectNameVariables {
  input: UpdateProjectNameInput;
}

export interface UpdateProjectNameInput {
  id: string;
  projectIdentifier: string;
  name: string;
}

export interface DescriptionFormProps {}

export interface DescriptionFormData {
  description: string;
}

export interface UpdateProjectDescriptionData {
  updateProjectDescription: UpdateProjectDescriptionPayload;
}

export interface UpdateProjectDescriptionPayload {
  __typename: string;
}

export interface UpdateProjectDescriptionVariables {
  input: UpdateProjectDescriptionInput;
}

export interface UpdateProjectDescriptionInput {
  id: string;
  projectIdentifier: string;
  description: string;
}

export interface ErrorPayload extends UpdateProjectDescriptionPayload, UpdateProjectNamePayload {
  __typename: 'ErrorPayload';
  message: string;
}
