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

import { gql, useQuery } from '@apollo/client';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  ChangeProposalFilesProps,
  ChangeProposalFilesState,
  ChangeResourceMetadata,
  GetChangeProposalData,
  GetChangeProposalVariables,
} from './ChangeProposalFiles.types';
import { GraphViewer } from './GraphViewer';
import { RawViewer } from './RawViewer';

const getChangeProposalFilesQuery = gql`
  query getChangeProposalFiles($id: ID!) {
    viewer {
      changeProposal(id: $id) {
        id
        name
        status
        change {
          id
          resources {
            edges {
              node {
                id
                name
                path
                contentType
              }
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
    resource: ChangeResourceMetadata
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
                  {state.changeProposal.change.resources.edges
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
              {state.changeProposal.change.resources.edges
                .map((edge) => edge.node)
                .map((resource) => (
                  <Box sx={{ paddingBottom: (theme) => theme.spacing(4) }} key={resource.id}>
                    {resource.contentType === 'TEXT_PLAIN' ? (
                      <RawViewer
                        id={resource.id}
                        path={resource.path}
                        name={resource.name}
                        changeId={state.changeProposal?.change.id ?? ''}
                        downloadURL={`${VITE_BACKEND_URL}/api/changes/${
                          state.changeProposal?.change.id ?? ''
                        }/resources/${resource.id}`}
                      />
                    ) : (
                      <GraphViewer
                        id={resource.id}
                        path={resource.path}
                        name={resource.name}
                        changeId={state.changeProposal?.change.id ?? ''}
                        downloadURL={`${VITE_BACKEND_URL}/api/changes/${
                          state.changeProposal?.change.id ?? ''
                        }/resources/${resource.id}`}
                      />
                    )}
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
