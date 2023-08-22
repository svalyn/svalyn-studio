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

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteOrganizationDialogProps } from './DeleteOrganizationDialog.types';
import { useDeleteOrganization } from './useDeleteOrganization';
import { DeleteOrganizationInput } from './useDeleteOrganization.types';

export const DeleteOrganizationDialog = ({ organizationIdentifier, open, onClose }: DeleteOrganizationDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const [deleteOrganization, { deleted, message }] = useDeleteOrganization();

  useEffect(() => {
    if (deleted) {
      navigate('/');
    }
    if (message) {
      enqueueSnackbar(message.body, { variant: message.severity });
    }
  }, [deleted, message]);

  const handleDeleteOrganization: React.MouseEventHandler<HTMLButtonElement> = () => {
    const input: DeleteOrganizationInput = {
      id: crypto.randomUUID(),
      organizationIdentifier,
    };

    deleteOrganization(input);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-organization-dialog-title"
      aria-describedby="delete-organization-dialog-description"
    >
      <DialogTitle id="delete-organization-dialog-title">Delete the organization</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-organization-dialog-description">
          By deleting this organization, you will lose all its data. This operation cannot be reversed. Think carefully
          about the consequences first.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDeleteOrganization}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
};
