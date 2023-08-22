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

import { gql, useMutation } from '@apollo/client';
import { Message } from '../../snackbar/Message.types';
import {
  DeleteOrganizationData,
  DeleteOrganizationInput,
  DeleteOrganizationResult,
  DeleteOrganizationVariables,
  ErrorPayload,
  UseDeleteOrganizationValue,
} from './useDeleteOrganization.types';

const deleteOrganizationMutation = gql`
  mutation deleteOrganization($input: DeleteOrganizationInput!) {
    deleteOrganization(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const useDeleteOrganization = (): UseDeleteOrganizationValue => {
  const [performOrganizationDeletion, { loading, data, error }] = useMutation<
    DeleteOrganizationData,
    DeleteOrganizationVariables
  >(deleteOrganizationMutation);

  const deleteOrganization = (input: DeleteOrganizationInput) => {
    performOrganizationDeletion({ variables: { input } });
  };

  let organizationDeleted: boolean = false;
  let organizationDeletionMessage: Message | null = null;

  if (data) {
    if (data.deleteOrganization.__typename === 'SuccessPayload') {
      organizationDeleted = true;
    } else if (data.deleteOrganization.__typename === 'ErrorPayload') {
      const errorPayload = data.deleteOrganization as ErrorPayload;
      organizationDeletionMessage = { body: errorPayload.message, severity: 'error' };
    }
  }
  if (error) {
    organizationDeletionMessage = { body: error.message, severity: 'error' };
  }

  const result: DeleteOrganizationResult = {
    loading,
    deleted: organizationDeleted,
    message: organizationDeletionMessage,
  };

  return [deleteOrganization, result];
};
