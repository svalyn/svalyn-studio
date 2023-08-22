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

import { gql, useMutation } from '@apollo/client';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import {
  ErrorPayload,
  InviteMemberData,
  InviteMemberDialogProps,
  InviteMemberDialogState,
  InviteMemberVariables,
} from './InviteMemberDialog.types';

const inviteMemberMutation = gql`
  mutation inviteMember($input: InviteMemberInput!) {
    inviteMember(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const InviteMemberDialog = ({ organizationIdentifier, open, onClose }: InviteMemberDialogProps) => {
  const [state, setState] = useState<InviteMemberDialogState>({
    email: '',
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleEmailChanged: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, email: value }));
  };

  const [inviteMember, { loading, data, error }] = useMutation<InviteMemberData, InviteMemberVariables>(
    inviteMemberMutation
  );
  useEffect(() => {
    if (!loading) {
      if (data) {
        if (data.inviteMember.__typename === 'SuccessPayload') {
          onClose();
        } else if (data.inviteMember.__typename === 'ErrorPayload') {
          const { message } = data.inviteMember as ErrorPayload;
          enqueueSnackbar(message, { variant: 'error' });
        }
      }
      if (error) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  }, [data, loading, error]);

  const sendInvitation: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: InviteMemberVariables = {
      input: {
        id: crypto.randomUUID(),
        organizationIdentifier,
        email: state.email,
      },
    };
    inviteMember({ variables });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" keepMounted={false} fullWidth>
      <DialogTitle>Invite a new member</DialogTitle>
      <DialogContent>
        <DialogContentText>Send an invitation to let someone join your organization</DialogContentText>
        <TextField
          type="email"
          label="Email"
          helperText="The email of the account to invite"
          value={state.email}
          onChange={handleEmailChanged}
          margin="dense"
          variant="standard"
          fullWidth
          autoFocus
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button onClick={sendInvitation}>Invite</Button>
      </DialogActions>
    </Dialog>
  );
};
