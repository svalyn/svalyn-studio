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

import PersonIcon from '@mui/icons-material/Person';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { hasMinLength, useForm } from '../forms/useForm';
import { AdminNewAccountViewFormData } from './AdminNewAccountView.types';
import { useCreateAccount } from './useCreateAccount';
import { CreateAccountInput } from './useCreateAccount.types';

export const AdminNewAccountView = () => {
  const { data, isFormValid, getTextFieldProps } = useForm<AdminNewAccountViewFormData>({
    initialValue: {
      name: '',
      email: '',
      username: '',
      password: '',
    },
    validationRules: {
      name: (data) => hasMinLength(data.name, 1),
      email: (data) => hasMinLength(data.email, 1),
      username: (data) => hasMinLength(data.username, 1),
      password: (data) => hasMinLength(data.password, 8),
    },
  });

  const { enqueueSnackbar } = useSnackbar();

  const [createAccount, { account, message }] = useCreateAccount();
  useEffect(() => {
    if (message) {
      enqueueSnackbar(message.body, { variant: message.severity });
    }
  }, [account, message]);

  const handleCreateAccount: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const input: CreateAccountInput = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      username: data.username,
    };
    createAccount(input);
  };

  if (account) {
    return <Navigate to="/admin/accounts" />;
  }

  return (
    <Box sx={{ paddingY: (theme) => theme.spacing(4) }}>
      <Container maxWidth="sm">
        <Toolbar />
        <Paper variant="outlined" sx={{ padding: (theme) => theme.spacing(2) }}>
          <form onSubmit={handleCreateAccount}>
            <Stack spacing={4}>
              <Typography variant="h4" align="center">
                Let's create an account
              </Typography>
              <TextField
                {...getTextFieldProps('name', 'The full name of the user')}
                label="Name"
                variant="outlined"
                autoFocus
                required
                inputProps={{
                  'aria-label': 'Name',
                }}
              />
              <TextField
                {...getTextFieldProps('email', 'The email address of the user')}
                label="Email"
                variant="outlined"
                required
                inputProps={{
                  'aria-label': 'Email',
                }}
              />
              <TextField
                {...getTextFieldProps(
                  'username',
                  'A unique username composed of letters, numbers, dashes and underscores'
                )}
                label="Username"
                variant="outlined"
                required
                inputProps={{
                  'aria-label': 'Username',
                }}
              />
              <TextField
                {...getTextFieldProps('password', 'A password with minimum 8 characters')}
                type="password"
                label="Password"
                variant="outlined"
                required
                inputProps={{
                  'aria-label': 'Password',
                }}
              />
              <Button type="submit" variant="contained" startIcon={<PersonIcon />} disabled={!isFormValid}>
                Create Account
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};
