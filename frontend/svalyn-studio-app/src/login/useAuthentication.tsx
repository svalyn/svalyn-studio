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

import { getCookie } from '../cookies/getCookie';
import { UseAuthenticationValue } from './useAuthentication.types';

const { VITE_BACKEND_URL } = import.meta.env;

export const useAuthentication = (): UseAuthenticationValue => {
  const login = (username: string, password: string) => {
    const body = new FormData();
    body.append('username', username);
    body.append('password', password);
    body.append('remember-me', 'true');

    const csrfToken = getCookie('XSRF-TOKEN');

    return fetch(`${VITE_BACKEND_URL}/api/login`, {
      body,
      mode: 'cors',
      credentials: 'include',
      method: 'POST',
      headers: {
        'X-XSRF-TOKEN': csrfToken,
      },
    });
  };

  const logout = () => {
    const csrfToken = getCookie('XSRF-TOKEN');

    return fetch(`${VITE_BACKEND_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'X-XSRF-TOKEN': csrfToken,
      },
    });
  };

  return {
    login,
    logout,
  };
};
