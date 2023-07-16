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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import { CopyButton } from '../../widgets/CopyButton';
import {
  CreateAuthenticationTokenData,
  CreateAuthenticationTokenSuccessPayload,
  CreateAuthenticationTokenVariables,
  NewAuthenticationTokenDialogProps,
  NewAuthenticationTokenDialogState,
} from './NewAuthenticationTokenDialog.types';

const createAuthenticationTokenMutation = gql`
  mutation createAuthenticationToken($input: CreateAuthenticationTokenInput!) {
    createAuthenticationToken(input: $input) {
      __typename
      ... on CreateAuthenticationTokenSuccessPayload {
        authenticationToken {
          name
          accessKey
          secretKey
        }
      }
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const NewAuthenticationTokenDialog = ({ open, onClose }: NewAuthenticationTokenDialogProps) => {
  const [state, setState] = useState<NewAuthenticationTokenDialogState>({
    name: '',
    errorSnackbarOpen: false,
  });

  const handleNameChanged: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, name: value }));
  };

  const [createAuthenticationToken, { data, error }] = useMutation<
    CreateAuthenticationTokenData,
    CreateAuthenticationTokenVariables
  >(createAuthenticationTokenMutation);
  useEffect(() => setState((prevState) => ({ ...prevState, errorSnackbarOpen: !!error })), [error]);

  const handleCreateAuthenticationToken: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: CreateAuthenticationTokenVariables = {
      input: {
        id: crypto.randomUUID(),
        name: state.name,
      },
    };
    createAuthenticationToken({ variables });
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, errorSnackbarOpen: false }));

  if (data && data.createAuthenticationToken.__typename === 'CreateAuthenticationTokenSuccessPayload') {
    const successPayload = data.createAuthenticationToken as CreateAuthenticationTokenSuccessPayload;

    return (
      <>
        <Dialog open={open} onClose={onClose} maxWidth="sm" keepMounted={false} fullWidth>
          <DialogTitle>Create a new authentication token</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
              <Typography>
                The authentication token "{successPayload.authenticationToken.name}" has been created
              </Typography>
              <CopyButton text={successPayload.authenticationToken.accessKey}>
                Access key: {successPayload.authenticationToken.accessKey}
              </CopyButton>
              <CopyButton text={successPayload.authenticationToken.secretKey}>
                Secret key: {successPayload.authenticationToken.secretKey}
              </CopyButton>
              <Typography>
                Make sure to copy both the access key and secret key in a secure location like a password manager right
                now. You won't be able to see them ever again.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </Dialog>
        <ErrorSnackbar open={state.errorSnackbarOpen} message={error?.message ?? null} onClose={handleCloseSnackbar} />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" keepMounted={false} fullWidth>
        <DialogTitle>Create a new authentication token</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            This dialog is used to generate authentication tokens. Once generated, you can give the token to a third
            party service which will then be able to request and manipulate your data on your behalf.
          </Typography>
          <TextField label="Token name" value={state.name} onChange={handleNameChanged} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreateAuthenticationToken} disabled={state.name.trim().length === 0}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <ErrorSnackbar open={state.errorSnackbarOpen} message={error?.message ?? null} onClose={handleCloseSnackbar} />
    </>
  );
};
