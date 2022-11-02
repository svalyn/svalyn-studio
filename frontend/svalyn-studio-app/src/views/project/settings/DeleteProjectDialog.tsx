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
import { v4 as uuid } from 'uuid';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  DeleteProjectData,
  DeleteProjectDialogProps,
  DeleteProjectDialogState,
  DeleteProjectVariables,
  ErrorPayload,
} from './DeleteProjectDialog.types';

const deleteProjectMutation = gql`
  mutation deleteProject($input: DeleteProjectInput!) {
    deleteProject(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const DeleteProjectDialog = ({ projectIdentifier, open, onClose }: DeleteProjectDialogProps) => {
  const [state, setState] = useState<DeleteProjectDialogState>({
    message: null,
  });

  const navigate = useNavigate();

  const [deleteProject, { loading: deleteProjectLoading, data: deleteProjectData, error: deleteProjectError }] =
    useMutation<DeleteProjectData, DeleteProjectVariables>(deleteProjectMutation);
  useEffect(() => {
    if (!deleteProjectLoading) {
      if (deleteProjectData) {
        if (deleteProjectData.deleteProject.__typename === 'SuccessPayload') {
          navigate('/');
        } else if (deleteProjectData.deleteProject.__typename === 'ErrorPayload') {
          const { message } = deleteProjectData.deleteProject as ErrorPayload;
          setState((prevState) => ({ ...prevState, message }));
        }
      }
      if (deleteProjectError) {
        setState((prevState) => ({ ...prevState, message: deleteProjectError.message }));
      }
    }
  }, [deleteProjectLoading, deleteProjectData, deleteProjectError]);

  const handleDeleteProject: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: DeleteProjectVariables = {
      input: {
        id: uuid(),
        projectIdentifier,
      },
    };

    deleteProject({ variables });
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="delete-project-dialog-title"
        aria-describedby="delete-project-dialog-description"
      >
        <DialogTitle id="delete-project-dialog-title">Delete the project</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-Project-dialog-description">
            By deleting this project, you will lose all its data. This operation cannot be reversed. Think carefully
            about the consequences first.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleDeleteProject}>Delete</Button>
        </DialogActions>
      </Dialog>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
