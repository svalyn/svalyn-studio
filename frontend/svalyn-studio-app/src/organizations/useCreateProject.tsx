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

import { gql, useMutation } from '@apollo/client';
import { Message } from '../snackbar/ErrorSnackbar.types';
import {
  CreateProjectData,
  CreateProjectInput,
  CreateProjectResult,
  CreateProjectSuccessPayload,
  CreateProjectVariables,
  ErrorPayload,
  Project,
  UseCreateProjectValue,
} from './useCreateProject.types';

const createProjectMutation = gql`
  mutation createProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      __typename
      ... on CreateProjectSuccessPayload {
        project {
          identifier
        }
      }
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const useCreateProject = (): UseCreateProjectValue => {
  const [performProjectCreation, { loading, data, error }] = useMutation<CreateProjectData, CreateProjectVariables>(
    createProjectMutation
  );

  const createProject = (input: CreateProjectInput) => {
    performProjectCreation({ variables: { input } });
  };

  let projectCreationData: Project | null = null;
  let projectCreationMessage: Message | null = null;

  if (data) {
    const { createProject } = data;
    if (createProject.__typename === 'CreateProjectSuccessPayload') {
      const createProjectSuccessPayload = createProject as CreateProjectSuccessPayload;
      projectCreationData = createProjectSuccessPayload.project;
    } else if (createProject.__typename === 'ErrorPayload') {
      const errorPayload = createProject as ErrorPayload;
      projectCreationMessage = { body: errorPayload.message, severity: 'error' };
    }
  }
  if (error) {
    projectCreationMessage = { body: error.message, severity: 'error' };
  }

  const result: CreateProjectResult = {
    loading,
    project: projectCreationData,
    message: projectCreationMessage,
  };

  return [createProject, result];
};
