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

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { DeleteAccountDialogProps } from './DeleteAccountDialog.types';
import { useDeleteAccount } from './useDeleteAccount';
import { DeleteAccountInput } from './useDeleteAccount.types';

export const DeleteAccountDialog = ({ open, username, onClose }: DeleteAccountDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [deleteAccount, { deleted, message }] = useDeleteAccount();
  useEffect(() => {
    if (message) {
      enqueueSnackbar(message.body, { variant: message.severity });
    }
  }, [message]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    const input: DeleteAccountInput = {
      id: crypto.randomUUID(),
      username,
    };
    deleteAccount(input);
  };

  if (deleted) {
    return <Navigate to="/" />;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle color="error">Delete your account</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Confirm the deletion of your account by clicking on the button below. It will not be possible to reverse this
          decision. This is your final opportunity to change your mind. All the data you own will be deleted, there's no
          going back after that.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" onClick={handleClick}>
          Delete Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};
