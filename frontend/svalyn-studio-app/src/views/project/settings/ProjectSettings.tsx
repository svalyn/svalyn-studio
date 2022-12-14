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
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import {
  ErrorPayload,
  ProjectSettingsProps,
  ProjectSettingsState,
  UpdateProjectDescriptionData,
  UpdateProjectDescriptionVariables,
  UpdateProjectNameData,
  UpdateProjectNameVariables,
} from './ProjectSettings.types';

const updateProjectNameMutation = gql`
  mutation updateProjectName($input: UpdateProjectNameInput!) {
    updateProjectName(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

const updateProjectDescriptionMutation = gql`
  mutation updateProjectDescription($input: UpdateProjectDescriptionInput!) {
    updateProjectDescription(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const ProjectSettings = ({ projectIdentifier, role }: ProjectSettingsProps) => {
  const [state, setState] = useState<ProjectSettingsState>({
    name: '',
    description: '',
    deleteProjectDialogOpen: false,
    message: null,
  });

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, name: value }));
  };

  const handleDescriptionChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, description: value }));
  };

  const navigate = useNavigate();

  const [
    updateProjectName,
    { loading: updateProjectNameLoading, data: updateProjectNameData, error: updateProjectNameError },
  ] = useMutation<UpdateProjectNameData, UpdateProjectNameVariables>(updateProjectNameMutation);
  useEffect(() => {
    if (!updateProjectNameLoading) {
      if (updateProjectNameData) {
        const { updateProjectName } = updateProjectNameData;
        if (updateProjectName.__typename === 'SuccessPayload') {
          navigate(`/projects/${projectIdentifier}`);
        } else if (updateProjectName.__typename === 'ErrorPayload') {
          const errorPayload = updateProjectName as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message }));
        }
      }
      if (updateProjectNameError) {
        setState((prevState) => ({ ...prevState, message: updateProjectNameError.message }));
      }
    }
  }, [updateProjectNameLoading, updateProjectNameData, updateProjectNameError]);

  const handleUpdateProjectName: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: UpdateProjectNameVariables = {
      input: {
        id: uuid(),
        projectIdentifier,
        name: state.name,
      },
    };
    updateProjectName({ variables });
  };

  const [
    updateProjectDescription,
    {
      loading: updateProjectDescriptionLoading,
      data: updateProjectDescriptionData,
      error: updateProjectDescriptionError,
    },
  ] = useMutation<UpdateProjectDescriptionData, UpdateProjectDescriptionVariables>(updateProjectDescriptionMutation);
  useEffect(() => {
    if (!updateProjectDescriptionLoading) {
      if (updateProjectDescriptionData) {
        const { updateProjectDescription } = updateProjectDescriptionData;
        if (updateProjectDescription.__typename === 'SuccessPayload') {
          navigate(`/projects/${projectIdentifier}`);
        } else if (updateProjectDescription.__typename === 'ErrorPayload') {
          const errorPayload = updateProjectDescription as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message }));
        }
      }
      if (updateProjectDescriptionError) {
        setState((prevState) => ({ ...prevState, message: updateProjectDescriptionError.message }));
      }
    }
  }, [updateProjectDescriptionLoading, updateProjectDescriptionData, updateProjectDescriptionError]);

  const handleUpdateProjectDescription: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: UpdateProjectDescriptionVariables = {
      input: {
        id: uuid(),
        projectIdentifier,
        description: state.description,
      },
    };
    updateProjectDescription({ variables });
  };

  const openDeleteProjectDialog: React.MouseEventHandler<HTMLButtonElement> = () => {
    setState((prevState) => ({ ...prevState, deleteProjectDialogOpen: true }));
  };
  const closeDeleteProjectDialog = () => {
    setState((prevState) => ({ ...prevState, deleteProjectDialogOpen: false }));
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <div>
        <Toolbar
          sx={{
            backgroundColor: 'white',
            borderBottom: '1px solid #dee2e7',
          }}
        >
          <Typography variant="h4" sx={{ marginRight: '2rem' }}>
            Settings
          </Typography>
        </Toolbar>
        <Container maxWidth="lg">
          <Paper sx={{ padding: (theme) => theme.spacing(3), marginTop: (theme) => theme.spacing(4) }}>
            <Typography variant="h5" gutterBottom>
              General
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: (theme) => theme.spacing(2),
                marginTop: (theme) => theme.spacing(2),
              }}
            >
              <TextField
                label="Project name"
                variant="outlined"
                size="small"
                value={state.name}
                onChange={handleNameChange}
                sx={{ flexGrow: '1' }}
                disabled={role === 'NONE'}
              />
              <Button
                variant="outlined"
                sx={{ whiteSpace: 'nowrap' }}
                onClick={handleUpdateProjectName}
                disabled={role === 'NONE'}
              >
                Update Name
              </Button>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: (theme) => theme.spacing(2),
                marginTop: (theme) => theme.spacing(2),
              }}
            >
              <TextField
                label="Project description"
                variant="outlined"
                size="small"
                helperText={`Help others understand your project (${state.description.length}/260 characters)`}
                multiline
                minRows={5}
                maxRows={5}
                inputProps={{ maxLength: 260 }}
                value={state.description}
                onChange={handleDescriptionChange}
                sx={{ flexGrow: '1' }}
                disabled={role === 'NONE'}
              />
              <Button variant="outlined" onClick={handleUpdateProjectDescription} disabled={role === 'NONE'}>
                Update Description
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ padding: (theme) => theme.spacing(3), marginTop: (theme) => theme.spacing(4) }}>
            <Typography variant="h5" gutterBottom>
              Delete this project
            </Typography>
            <Typography gutterBottom>Once you delete a project, there is no going back. Please be certain.</Typography>
            <Button variant="outlined" onClick={openDeleteProjectDialog} disabled={role === 'NONE'}>
              Delete Project
            </Button>
          </Paper>
        </Container>
      </div>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
      {state.deleteProjectDialogOpen ? (
        <DeleteProjectDialog
          open={state.deleteProjectDialogOpen}
          onClose={closeDeleteProjectDialog}
          projectIdentifier={projectIdentifier}
        />
      ) : null}
    </>
  );
};
