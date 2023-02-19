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
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import { ViewerCard } from '../../viewers/ViewerCard';
import { NotFoundView } from '../notfound/NotFoundView';
import { GetResourceData, GetResourceVariables, ResourceViewState } from './ResourceView.types';

const getResourceQuery = gql`
  query getResource($projectIdentifier: ID!) {
    viewer {
      project(identifier: $projectIdentifier) {
        name
        organization {
          identifier
          name
        }
      }
    }
  }
`;

export const ResourceView = () => {
  const [state, setState] = useState<ResourceViewState>({ message: null });

  const { projectIdentifier, changeId, '*': fullpath } = useParams();

  let path = '';
  let name = fullpath ?? '';
  const lastSlashIndex = name.lastIndexOf('/');
  if (lastSlashIndex != -1 && lastSlashIndex != name.length - 1) {
    path = name.substring(0, lastSlashIndex);
    if (path.startsWith('/')) {
      path = path.substring('/'.length);
    }
    name = name.substring(lastSlashIndex + '/'.length);
  }

  const variables: GetResourceVariables = {
    projectIdentifier: projectIdentifier ?? '',
  };
  const { data, error } = useQuery<GetResourceData, GetResourceVariables>(getResourceQuery, { variables });
  useEffect(() => {
    if (error) {
      setState((prevState) => ({ ...prevState, message: error.message }));
    }
  }, [error]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (name.length === 0) {
    return <NotFoundView />;
  }
  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        {data && data.viewer.project ? (
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
                to={`/orgs/${data.viewer.project.organization.identifier}`}
              >
                {data.viewer.project.organization.name}
              </Link>
              <Typography variant="h4">/</Typography>
              <Link variant="h4" underline="hover" component={RouterLink} to={`/projects/${projectIdentifier}`}>
                {data.viewer.project.name}
              </Link>
            </Box>
            <Container maxWidth="lg">
              <Paper variant="outlined">
                <ViewerCard changeId={changeId ?? ''} path={path} name={name} />
              </Paper>
            </Container>
          </Box>
        ) : null}
      </Box>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
