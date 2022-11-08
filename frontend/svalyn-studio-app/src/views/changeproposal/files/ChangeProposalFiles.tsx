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
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  ChangeProposalFilesProps,
  ChangeProposalFilesState,
  GetChangeProposalData,
  GetChangeProposalVariables,
  Resource,
} from './ChangeProposalFiles.types';

const getChangeProposalFilesQuery = gql`
  query getChangeProposalFiles($id: ID!) {
    viewer {
      changeProposal(id: $id) {
        id
        name
        status
        resources {
          edges {
            node {
              id
              name
              content
            }
          }
        }
      }
    }
  }
`;

const { VITE_BACKEND_URL } = import.meta.env;

export const ChangeProposalFiles = ({ changeProposalId }: ChangeProposalFilesProps) => {
  const [state, setState] = useState<ChangeProposalFilesState>({ changeProposal: null, message: null });

  const variables: GetChangeProposalVariables = { id: changeProposalId };
  const { loading, data, error } = useQuery<GetChangeProposalData, GetChangeProposalVariables>(
    getChangeProposalFilesQuery,
    { variables }
  );
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { changeProposal },
        } = data;
        if (changeProposal) {
          setState((prevState) => ({ ...prevState, changeProposal }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const handleResourceClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent> | React.MouseEvent<HTMLSpanElement, MouseEvent>,
    resource: Resource
  ) => {
    event.preventDefault();
    var element = document.getElementById(resource.id);
    if (element) {
      element.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      {state.changeProposal ? (
        <Box sx={{ padding: (theme) => theme.spacing(4) }}>
          <Grid container spacing={4}>
            <Grid item xs={2}>
              <Paper variant="outlined">
                <List>
                  {state.changeProposal.resources.edges
                    .map((edge) => edge.node)
                    .map((resource) => (
                      <ListItem
                        key={resource.id}
                        component={Link}
                        href={`#${resource.id}`}
                        onClick={(
                          event:
                            | React.MouseEvent<HTMLAnchorElement, MouseEvent>
                            | React.MouseEvent<HTMLSpanElement, MouseEvent>
                        ) => handleResourceClick(event, resource)}
                      >
                        <ListItemIcon>
                          <InsertDriveFileIcon />
                        </ListItemIcon>
                        <ListItemText primary={resource.name} />
                      </ListItem>
                    ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={10}>
              {state.changeProposal.resources.edges
                .map((edge) => edge.node)
                .map((resource) => (
                  <Box sx={{ paddingBottom: (theme) => theme.spacing(4) }} key={resource.id}>
                    <Paper
                      id={resource.id}
                      variant="outlined"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
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
                        <Typography variant="subtitle1">{resource.name}</Typography>
                        <div>
                          <IconButton
                            component="a"
                            type="application/octet-stream"
                            href={`${VITE_BACKEND_URL}/api/changeproposals/${changeProposalId}/resources/${resource.id}`}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </Box>
                      <Divider />
                      <Box sx={{ px: (theme) => theme.spacing(2), overflowX: 'scroll' }}>
                        <pre>{resource.content}</pre>
                      </Box>
                    </Paper>
                  </Box>
                ))}
            </Grid>
          </Grid>
        </Box>
      ) : null}
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
