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
import { Message } from '../snackbar/Message.types';
import {
  CreateOrganizationData,
  CreateOrganizationInput,
  CreateOrganizationResult,
  CreateOrganizationSuccessPayload,
  CreateOrganizationVariables,
  ErrorPayload,
  Organization,
  UseCreateOrganizationValue,
} from './useCreateOrganization.types';

const createOrganizationMutation = gql`
  mutation createOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      __typename
      ... on CreateOrganizationSuccessPayload {
        organization {
          identifier
        }
      }
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const useCreateOrganization = (): UseCreateOrganizationValue => {
  const [performOrganizationCreation, { loading, data, error }] = useMutation<
    CreateOrganizationData,
    CreateOrganizationVariables
  >(createOrganizationMutation);

  const createOrganization = (input: CreateOrganizationInput) => {
    performOrganizationCreation({ variables: { input } });
  };

  let organizationCreationData: Organization | null = null;
  let organizationCreationMessage: Message | null = null;

  if (data) {
    const { createOrganization } = data;
    if (createOrganization.__typename === 'CreateOrganizationSuccessPayload') {
      const createOrganizationSuccessPayload = createOrganization as CreateOrganizationSuccessPayload;
      organizationCreationData = createOrganizationSuccessPayload.organization;
    } else if (createOrganization.__typename === 'ErrorPayload') {
      const errorPayload = createOrganization as ErrorPayload;
      organizationCreationMessage = { body: errorPayload.message, severity: 'error' };
    }
  }
  if (error) {
    organizationCreationMessage = { body: error.message, severity: 'error' };
  }

  const result: CreateOrganizationResult = {
    loading,
    organization: organizationCreationData,
    message: organizationCreationMessage,
  };

  return [createOrganization, result];
};
