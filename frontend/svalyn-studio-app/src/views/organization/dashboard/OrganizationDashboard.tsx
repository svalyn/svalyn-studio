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

import { gql, useLazyQuery } from '@apollo/client';
import Box, { BoxProps } from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  GetOrganizationDashboardData,
  GetOrganizationDashboardVariables,
  OrganizationDashboardProps,
  OrganizationDashboardState,
} from './OrganizationDashboard.types';

const getOrganizationDashboardQuery = gql`
  query getOrganizationDashboard($identifier: ID!) {
    viewer {
      organization(identifier: $identifier) {
        projects {
          edges {
            node {
              identifier
              name
              description
            }
          }
        }
      }
    }
  }
`;

const Main = styled(Box)<BoxProps>(({ theme }) => ({
  padding: theme.spacing(3),
}));

export const OrganizationDashboard = ({ organizationIdentifier }: OrganizationDashboardProps) => {
  const [state, setState] = useState<OrganizationDashboardState>({
    organization: null,
    message: null,
  });

  const [getOrganizationDashboard, { loading, data, error }] = useLazyQuery<
    GetOrganizationDashboardData,
    GetOrganizationDashboardVariables
  >(getOrganizationDashboardQuery);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { organization },
        } = data;
        if (organization) {
          setState((prevState) => ({ ...prevState, organization }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  useEffect(() => {
    if (organizationIdentifier) {
      const variables: GetOrganizationDashboardVariables = { identifier: organizationIdentifier };
      getOrganizationDashboard({ variables });
    }
  }, [organizationIdentifier]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const projects = state.organization?.projects.edges.map((edge) => edge.node) ?? [];
  return (
    <>
      <Main>
        <Typography variant="h6" gutterBottom>
          Dashboard
        </Typography>
        <div>
          {projects.map((project) => (
            <Paper variant="outlined" key={project.identifier} sx={{ marginBottom: (theme) => theme.spacing(4) }}>
              <Box
                sx={{
                  paddingTop: (theme) => theme.spacing(2),
                  paddingRight: (theme) => theme.spacing(3),
                  paddingBottom: (theme) => theme.spacing(2),
                  paddingLeft: (theme) => theme.spacing(3),
                }}
              >
                <Link variant="h5" underline="hover" component={RouterLink} to={`/projects/${project.identifier}`}>
                  {project.name}
                </Link>
              </Box>
              <Divider />
              <Box
                sx={{
                  paddingTop: (theme) => theme.spacing(2),
                  paddingRight: (theme) => theme.spacing(3),
                  paddingBottom: (theme) => theme.spacing(2),
                  paddingLeft: (theme) => theme.spacing(3),
                }}
              >
                <Typography>{project.description}</Typography>
              </Box>
            </Paper>
          ))}
        </div>
      </Main>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
