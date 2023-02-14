/*
 * Copyright (c) 2023 Stéphane Bégaudeau.
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
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ActivityTimeline } from '../../../activity/ActivityTimeline';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  GetProjectActivityData,
  GetProjectActivityVariables,
  ProjectActivityProps,
  ProjectActivityState,
} from './ProjectActivity.types';

const getProjectActivityQuery = gql`
  query getProjectActivity($identifier: ID!) {
    viewer {
      project(identifier: $identifier) {
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

export const ProjectActivity = ({ projectIdentifier }: ProjectActivityProps) => {
  const [state, setState] = useState<ProjectActivityState>({
    message: null,
  });

  const variables: GetProjectActivityVariables = {
    identifier: projectIdentifier,
  };
  const { data, error } = useQuery<GetProjectActivityData, GetProjectActivityVariables>(getProjectActivityQuery, {
    variables,
  });
  useEffect(() => {
    if (error) {
      setState((prevState) => ({ ...prevState, message: error.message }));
    }
  }, [error]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));
  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: (theme) => theme.spacing(2),
          paddingTop: (theme) => theme.spacing(4),
        }}
      >
        <Typography variant="h6" gutterBottom>
          Activity
        </Typography>
        {data?.viewer.project ? (
          <ActivityTimeline activityEntries={data.viewer.project.activityEntries.edges.map((edge) => edge.node)} />
        ) : null}
      </Container>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
