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
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DeleteProjectData,
  DeleteProjectDialogProps,
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
  const { enqueueSnackbar } = useSnackbar();
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
          enqueueSnackbar(message, { variant: 'error' });
        }
      }
      if (deleteProjectError) {
        enqueueSnackbar(deleteProjectError.message, { variant: 'error' });
      }
    }
  }, [deleteProjectLoading, deleteProjectData, deleteProjectError]);

  const handleDeleteProject: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: DeleteProjectVariables = {
      input: {
        id: crypto.randomUUID(),
        projectIdentifier,
      },
    };

    deleteProject({ variables });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-project-dialog-title"
      aria-describedby="delete-project-dialog-description"
    >
      <DialogTitle id="delete-project-dialog-title">Delete the project</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-Project-dialog-description">
          By deleting this project, you will lose all its data. This operation cannot be reversed. Think carefully about
          the consequences first.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleDeleteProject}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
};
