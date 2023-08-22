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
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ActivityTimeline } from '../activity/ActivityTimeline';
import { Navbar } from '../navbars/Navbar';
import { GetViewerData, GetViewerVariables } from './ProfileView.types';

const getViewerQuery = gql`
  query getViewer($username: String!) {
    viewer {
      profile(username: $username) {
        name
        username
        imageUrl
        activityEntries(page: 0, rowsPerPage: 20) {
          edges {
            node {
              id
              kind
              title
              description
              createdOn
              createdBy {
                name
                username
                imageUrl
              }
            }
          }
        }
      }
    }
  }
`;

export const ProfileView = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { username } = useParams();
  const variables: GetViewerVariables = { username: username ?? '' };
  const { data, error } = useQuery<GetViewerData, GetViewerVariables>(getViewerQuery, { variables });
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  return (
    <div>
      <Navbar />
      <Container maxWidth="xl">
        <Toolbar />
        {data?.viewer?.profile ? (
          <Grid container spacing={2}>
            <Grid item xs={4} justifyContent="center">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={data.viewer.profile.imageUrl}
                  alt={data.viewer.profile.name}
                  sx={{ width: 200, height: 200 }}
                />
                <Typography variant="h6">{data.viewer.profile.name}</Typography>
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="h4" gutterBottom>
                Activity
              </Typography>
              <ActivityTimeline activityEntries={data.viewer.profile.activityEntries.edges.map((edge) => edge.node)} />
            </Grid>
          </Grid>
        ) : null}
      </Container>
    </div>
  );
};
