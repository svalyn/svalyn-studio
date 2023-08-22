/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../cookies/getCookie';
import { hasMinLength, useForm } from '../forms/useForm';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import { LoginWithCredentialsFormData, LoginWithCredentialsState } from './LoginWithCredentials.types';

const { VITE_BACKEND_URL } = import.meta.env;

export const LoginWithCredentials = () => {
  const [state, setState] = useState<LoginWithCredentialsState>({
    message: null,
  });

  const { data, isFormValid, getTextFieldProps } = useForm<LoginWithCredentialsFormData>({
    initialValue: {
      username: '',
      password: '',
    },
    validationRules: {
      username: (data) => hasMinLength(data.username, 0),
      password: (data) => hasMinLength(data.password, 8),
    },
  });

  const navigate = useNavigate();
  const handleLogin: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const body = new FormData();
    body.append('username', data.username);
    body.append('password', data.password);
    body.append('remember-me', 'true');

    const csrfToken = getCookie('XSRF-TOKEN');

    fetch(`${VITE_BACKEND_URL}/api/login`, {
      body,
      mode: 'cors',
      credentials: 'include',
      method: 'POST',
      headers: {
        'X-XSRF-TOKEN': csrfToken,
      },
    }).then((response) => {
      if (response.ok) {
        navigate('/');
      } else {
        setState((prevState) => ({ ...prevState, message: 'Invalid login or password' }));
      }
    });
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <Box>
        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <Typography variant="h6">Login</Typography>
            <TextField
              {...getTextFieldProps('username')}
              label="Username"
              variant="outlined"
              fullWidth
              autoFocus
              required
              inputProps={{
                'aria-label': 'Username',
              }}
            />
            <TextField
              {...getTextFieldProps('password')}
              type="password"
              label="Password"
              variant="outlined"
              fullWidth
              required
              inputProps={{
                'aria-label': 'Password',
              }}
            />
            <Button type="submit" variant="contained" disabled={!isFormValid}>
              Login
            </Button>
          </Stack>
        </form>
      </Box>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
