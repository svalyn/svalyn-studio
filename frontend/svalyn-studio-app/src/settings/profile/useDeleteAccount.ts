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
import { Message } from '../../snackbar/Message.types';
import {
  DeleteAccountData,
  DeleteAccountInput,
  DeleteAccountResult,
  DeleteAccountVariables,
  ErrorPayload,
  UseDeleteAccountValue,
} from './useDeleteAccount.types';

const deleteAccountMutation = gql`
  mutation deleteAccount($input: DeleteAccountInput!) {
    deleteAccount(input: $input) {
      __typename
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const useDeleteAccount = (): UseDeleteAccountValue => {
  const [performAccountDeletion, { loading, data, error }] = useMutation<DeleteAccountData, DeleteAccountVariables>(
    deleteAccountMutation
  );

  const deleteAccount = (input: DeleteAccountInput) => {
    performAccountDeletion({ variables: { input } });
  };

  let accountDeleted: boolean = false;
  let accountDeletedMessage: Message | null = null;

  if (data) {
    if (data.deleteAccount.__typename === 'SuccessPayload') {
      accountDeleted = true;
    } else if (data.deleteAccount.__typename === 'ErrorPayload') {
      const errorPayload = data.deleteAccount as ErrorPayload;
      accountDeletedMessage = { body: errorPayload.message, severity: 'error' };
    }
  }
  if (error) {
    accountDeletedMessage = { body: error.message, severity: 'error' };
  }

  const result: DeleteAccountResult = {
    loading,
    deleted: accountDeleted,
    message: accountDeletedMessage,
  };

  return [deleteAccount, result];
};
