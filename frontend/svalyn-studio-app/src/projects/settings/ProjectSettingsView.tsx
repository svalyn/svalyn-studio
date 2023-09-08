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

import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useProject } from '../useProject';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { DetailsCard } from './DetailsCard';
import { ProjectSettingsViewState } from './ProjectSettingsView.types';

export const ProjectSettingsView = () => {
  const {
    identifier: projectIdentifier,
    organization: { role },
  } = useProject();
  const [state, setState] = useState<ProjectSettingsViewState>({
    deleteProjectDialogOpen: false,
  });

  const openDeleteProjectDialog: React.MouseEventHandler<HTMLButtonElement> = () => {
    setState((prevState) => ({ ...prevState, deleteProjectDialogOpen: true }));
  };
  const closeDeleteProjectDialog = () => {
    setState((prevState) => ({ ...prevState, deleteProjectDialogOpen: false }));
  };

  return (
    <>
      <div>
        <Toolbar
          variant="dense"
          sx={{
            backgroundColor: 'white',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(2) }}>
            <SettingsIcon fontSize="medium" />
            <Typography variant="h5">Settings</Typography>
          </Box>
        </Toolbar>
        <Container maxWidth="lg">
          <DetailsCard />

          <Paper sx={{ padding: (theme) => theme.spacing(2), marginTop: (theme) => theme.spacing(4) }}>
            <Typography variant="h6" color="error" gutterBottom>
              Delete this project
            </Typography>
            <Typography gutterBottom>Once you delete a project, there is no going back. Please be certain.</Typography>
            <Button variant="outlined" color="error" onClick={openDeleteProjectDialog} disabled={role === 'NONE'}>
              Delete Project
            </Button>
          </Paper>
        </Container>
      </div>
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
