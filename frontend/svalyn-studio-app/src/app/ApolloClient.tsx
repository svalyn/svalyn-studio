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

import { ApolloClient, DefaultOptions, HttpLink, InMemoryCache, ServerError } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getCookie } from '../cookies/getCookie';

const { VITE_BACKEND_URL } = import.meta.env;

const httpLink = new HttpLink({
  uri: `${VITE_BACKEND_URL}/api/graphql`,
  credentials: `include`,
});

const csrfLink = setContext((_, { headers }) => {
  const csrfToken = getCookie('XSRF-TOKEN');
  return {
    headers: {
      ...headers,
      'X-XSRF-TOKEN': csrfToken,
    },
  };
});

const getErrorLink = (onAuthenticationError: () => void) => {
  return onError(({ networkError }) => {
    if (networkError && (networkError as ServerError).statusCode === 401) {
      onAuthenticationError();
    }
  });
};

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
  },
  query: {
    fetchPolicy: 'no-cache',
  },
  mutate: {
    fetchPolicy: 'no-cache',
  },
};

export const getApolloClient = (onAuthenticationError: () => void) => {
  return new ApolloClient({
    link: csrfLink.concat(getErrorLink(onAuthenticationError).concat(httpLink)),
    cache: new InMemoryCache(),
    connectToDevTools: true,
    defaultOptions,
  });
};
