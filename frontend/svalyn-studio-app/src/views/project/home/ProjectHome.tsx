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

import { gql, useQuery } from '@apollo/client';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import { EditReadMeDialog } from './EditReadMeDialog';
import { GetProjectHomeData, GetProjectHomeVariables, ProjectHomeProps, ProjectHomeState } from './ProjectHome.types';

const getProjectHomeQuery = gql`
  query getProjectHome($identifier: ID!) {
    viewer {
      project(identifier: $identifier) {
        name
        description
        readMe
        organization {
          identifier
          name
        }
      }
    }
  }
`;

const trimLines = (content: string): string =>
  content
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

export const ProjectHome = ({ projectIdentifier, role }: ProjectHomeProps) => {
  const [state, setState] = useState<ProjectHomeState>({
    project: null,
    editReadMeDialogOpen: false,
    message: null,
  });

  const variables: GetProjectHomeVariables = { identifier: projectIdentifier };
  const { loading, data, error, refetch } = useQuery<GetProjectHomeData, GetProjectHomeVariables>(getProjectHomeQuery, {
    variables,
  });
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { project },
        } = data;
        if (project) {
          setState((prevState) => ({ ...prevState, project, editReadMeDialogOpen: false }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message, editReadMeDialogOpen: false }));
      }
    }
  }, [loading, data, error]);

  const openReadMeDialog = () => setState((prevState) => ({ ...prevState, editReadMeDialogOpen: true }));
  const closeReadMeDialog = () => refetch(variables);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const readMe = trimLines(state.project?.readMe ?? '');

  return (
    <>
      {state.project ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: (theme) => theme.spacing(2),
            padding: (theme) => theme.spacing(4),
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: (theme) => theme.spacing(1) }}>
            <Link
              variant="h4"
              underline="hover"
              component={RouterLink}
              to={`/orgs/${state.project.organization.identifier}`}
            >
              {state.project.organization.name}
            </Link>
            <Typography variant="h4">/</Typography>
            <Typography variant="h4">{state.project.name}</Typography>
          </Box>
          <Grid container>
            <Grid item xs={10}>
              <>
                <Paper variant="outlined">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: (theme) => theme.spacing(2),
                      py: '2px',
                    }}
                  >
                    <Typography variant="subtitle1">README.md</Typography>
                    <div>
                      <IconButton sx={{ marginRight: '4px' }} onClick={openReadMeDialog} disabled={role === 'NONE'}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton component="a" download="README.md" href={URL.createObjectURL(new Blob([readMe]))}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </Box>
                  <Divider />
                  <Box sx={{ px: (theme) => theme.spacing(2), py: (theme) => theme.spacing(1) }}>
                    <ReactMarkdown children={readMe} />
                  </Box>
                </Paper>
                <EditReadMeDialog
                  projectIdentifier={projectIdentifier}
                  content={readMe}
                  open={state.editReadMeDialogOpen}
                  onClose={closeReadMeDialog}
                />
              </>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="h6" gutterBottom sx={{ px: (theme) => theme.spacing(2) }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ px: (theme) => theme.spacing(2) }}>
                {state.project.description}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      ) : null}
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
