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
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { hasMinLength, useForm } from '../forms/useForm';
import { LoginWithCredentialsFormData } from './LoginWithCredentials.types';
import { useAuthentication } from './useAuthentication';

export const LoginWithCredentials = () => {
  const { data, isFormValid, getTextFieldProps } = useForm<LoginWithCredentialsFormData>({
    initialValue: {
      username: '',
      password: '',
    },
    validationRules: {
      username: (data) => hasMinLength(data.username, 1),
      password: (data) => hasMinLength(data.password, 8),
    },
  });

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { login } = useAuthentication();

  const handleLogin: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    login(data.username, data.password).then((response) => {
      if (response.ok) {
        navigate('/');
      } else {
        enqueueSnackbar('Invalid login or password', { variant: 'error' });
      }
    });
  };

  return (
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
  );
};
