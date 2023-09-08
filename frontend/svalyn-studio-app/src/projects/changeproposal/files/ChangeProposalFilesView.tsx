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
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ViewerCard } from '../../../viewers/ViewerCard';
import {
  ChangeProposalFilesViewState,
  ChangeResourceMetadata,
  GetChangeProposalData,
  GetChangeProposalVariables,
} from './ChangeProposalFilesView.types';

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
                name
                path
              }
            }
          }
        }
      }
    }
  }
`;

export const ChangeProposalFilesView = () => {
  const { changeProposalIdentifier } = useParams();
  const [state, setState] = useState<ChangeProposalFilesViewState>({ changeProposal: null });

  const { enqueueSnackbar } = useSnackbar();

  const variables: GetChangeProposalVariables = { id: changeProposalIdentifier ?? '' };
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
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  }, [loading, data, error]);

  const handleResourceClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent> | React.MouseEvent<HTMLSpanElement, MouseEvent>,
    resource: ChangeResourceMetadata
  ) => {
    event.preventDefault();
    const fullpath = resource.path.length > 0 ? `${resource.path}/${resource.name}` : resource.name;
    var element = document.getElementById(fullpath);
    if (element) {
      element.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  if (!state.changeProposal) {
    return null;
  }

  return (
    <Box
      sx={{
        padding: (theme) => theme.spacing(4),
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={2}>
          <Paper variant="outlined">
            <List>
              {state.changeProposal.change.resources.edges
                .map((edge) => edge.node)
                .map((resource) => {
                  const fullpath = resource.path.length > 0 ? `${resource.path}/${resource.name}` : resource.name;
                  return (
                    <ListItem
                      key={fullpath}
                      component={Link}
                      href={`${fullpath}`}
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
                  );
                })}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={10}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
            {state.changeProposal.change.resources.edges
              .map((edge) => edge.node)
              .map((resource) => {
                const fullpath = resource.path.length > 0 ? `${resource.path}/${resource.name}` : resource.name;
                return (
                  <ViewerCard
                    changeId={state.changeProposal?.change.id ?? ''}
                    path={resource.path}
                    name={resource.name}
                    key={fullpath}
                  />
                );
              })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
