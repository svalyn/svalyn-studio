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

import ClassIcon from '@mui/icons-material/Class';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Theme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import { NewProjectDialogProps, NewProjectDialogState } from './NewProjectDialog.types';
import { useCreateProject } from './useCreateProject';
import { CreateProjectInput } from './useCreateProject.types';

export const NewProjectDialog = ({ organizationIdentifier, open, onClose }: NewProjectDialogProps) => {
  const [state, setState] = useState<NewProjectDialogState>({
    identifier: '',
    name: '',
    description: '',
    isFormValid: false,
    message: null,
  });

  const handleIdentifierChanged: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({
      ...prevState,
      identifier: value,
      isFormValid: value.length > 0 && prevState.name.length > 0,
    }));
  };
  const handleNameChanged: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({
      ...prevState,
      name: value,
      isFormValid: value.length > 0 && prevState.identifier.length > 0,
    }));
  };
  const handleDescriptionChanged: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, description: value }));
  };

  const [createProject, { project, message }] = useCreateProject();
  useEffect(() => {
    if (message) {
      setState((prevState) => ({ ...prevState, message: message.body }));
    }
  }, [message]);

  const handleCreateProject: React.MouseEventHandler<HTMLButtonElement> = () => {
    const { identifier, name, description } = state;
    const input: CreateProjectInput = {
      id: crypto.randomUUID(),
      organizationIdentifier,
      identifier: identifier,
      name,
      description,
    };
    createProject(input);
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (project) {
    return <Navigate to={`/projects/${project.identifier}`} />;
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" keepMounted={false} fullWidth>
        <Box sx={{ padding: (theme: Theme) => theme.spacing(3) }}>
          <Typography variant="h4" gutterBottom>
            Let's set up your project
          </Typography>
          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={7}>
              <Stack direction="column">
                <Typography variant="h6" sx={{ paddingBottom: (theme) => theme.spacing(2) }}>
                  Create a project to start managing your models
                </Typography>
                <Stack direction="column" spacing={4}>
                  <TextField
                    label="Project Name"
                    helperText="This is where your various models will live"
                    value={state.name}
                    onChange={handleNameChanged}
                    autoFocus
                    required
                    inputProps={{
                      'aria-label': 'Project Name',
                    }}
                  />
                  <TextField
                    label="Project Identifier"
                    helperText="A unique identifier composed of letters, numbers and dashes"
                    value={state.identifier}
                    onChange={handleIdentifierChanged}
                    required
                    inputProps={{
                      'aria-label': 'Project Identifier',
                    }}
                  />
                  <TextField
                    label="Description"
                    helperText={`Help others understand your project (${state.description.length}/260 characters)`}
                    value={state.description}
                    onChange={handleDescriptionChanged}
                    minRows={5}
                    maxRows={5}
                    multiline
                    inputProps={{ 'aria-label': 'Project Description', maxLength: 260 }}
                  />
                </Stack>
              </Stack>
            </Grid>
            <Grid container item xs={5} direction="column" justifyContent="space-between" alignItems="stretch">
              <div>
                <Typography variant="h6" gutterBottom>
                  What is a project?
                </Typography>
                <Typography>
                  A project is the container of all your models. It represents the business that you want to manage
                  using a model driven approach. You can use a project to contain various interconnected models which
                  will be used to capture some information about your work.
                </Typography>
              </div>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button variant="outlined" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  startIcon={<ClassIcon />}
                  variant="contained"
                  onClick={handleCreateProject}
                  disabled={!state.isFormValid}
                >
                  Create project
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
