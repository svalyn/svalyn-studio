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

import { Message } from '../snackbar/Message.types';

export type UseCreateAccountValue = [createAccount: (input: CreateAccountInput) => void, result: CreateAccountResult];

export interface CreateAccountInput {
  id: string;
  name: string;
  username: string;
  password: string;
  email: string;
}

export interface CreateAccountPayload {
  __typename: string;
}

export interface ErrorPayload extends CreateAccountPayload {
  __typename: 'ErrorPayload';
  message: string;
}

export interface CreateAccountSuccessPayload extends CreateAccountPayload {
  __typename: 'CreateAccountSuccessPayload';
  account: Account;
}

export interface CreateAccountVariables {
  input: CreateAccountInput;
}

export interface CreateAccountData {
  createAccount: CreateAccountPayload;
}

export interface CreateAccountResult {
  loading: boolean;
  account: Account | null;
  message: Message | null;
}

export interface Account {
  username: string;
}
