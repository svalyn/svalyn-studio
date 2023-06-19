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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  DeleteOrganizationData,
  DeleteOrganizationDialogProps,
  DeleteOrganizationDialogState,
  DeleteOrganizationVariables,
  ErrorPayload,
} from './DeleteOrganizationDialog.types';

const deleteOrganizationMutation = gql`
  mutation deleteOrganization($input: DeleteOrganizationInput!) {
    deleteOrganization(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const DeleteOrganizationDialog = ({ organizationIdentifier, open, onClose }: DeleteOrganizationDialogProps) => {
  const [state, setState] = useState<DeleteOrganizationDialogState>({
    message: null,
  });

  const navigate = useNavigate();

  const [
    deleteOrganization,
    { loading: deleteOrganizationLoading, data: deleteOrganizationData, error: deleteOrganizationError },
  ] = useMutation<DeleteOrganizationData, DeleteOrganizationVariables>(deleteOrganizationMutation);
  useEffect(() => {
    if (!deleteOrganizationLoading) {
      if (deleteOrganizationData) {
        if (deleteOrganizationData.deleteOrganization.__typename === 'SuccessPayload') {
          navigate('/');
        } else if (deleteOrganizationData.deleteOrganization.__typename === 'ErrorPayload') {
          const { message } = deleteOrganizationData.deleteOrganization as ErrorPayload;
          setState((prevState) => ({ ...prevState, message }));
        }
      }
      if (deleteOrganizationError) {
        setState((prevState) => ({ ...prevState, message: deleteOrganizationError.message }));
      }
    }
  }, [deleteOrganizationLoading, deleteOrganizationData, deleteOrganizationError]);

  const handleDeleteOrganization: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: DeleteOrganizationVariables = {
      input: {
        id: crypto.randomUUID(),
        organizationIdentifier,
      },
    };

    deleteOrganization({ variables });
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="delete-organization-dialog-title"
        aria-describedby="delete-organization-dialog-description"
      >
        <DialogTitle id="delete-organization-dialog-title">Delete the organization</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-organization-dialog-description">
            By deleting this organization, you will lose all its data. This operation cannot be reversed. Think
            carefully about the consequences first.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleDeleteOrganization}>Delete</Button>
        </DialogActions>
      </Dialog>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
