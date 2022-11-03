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
import Box, { BoxProps } from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import { CreatedOn } from '../../../widgets/CreatedOn';
import { LastModifiedOn } from '../../../widgets/LastModifiedOn';
import {
  GetOrganizationDashboardData,
  GetOrganizationDashboardVariables,
  OrganizationDashboardProps,
  OrganizationDashboardState,
} from './OrganizationDashboard.types';
import { ProjectCard } from './ProjectCard';

const getOrganizationDashboardQuery = gql`
  query getOrganizationDashboard($identifier: ID!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      organization(identifier: $identifier) {
        createdOn
        createdBy {
          name
          imageUrl
        }
        lastModifiedOn
        lastModifiedBy {
          name
          imageUrl
        }
        projects(page: $page, rowsPerPage: $rowsPerPage) {
          edges {
            node {
              identifier
              name
              description
            }
          }
          pageInfo {
            count
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
    page: 0,
    rowsPerPage: 10,
    message: null,
  });

  const variables: GetOrganizationDashboardVariables = {
    identifier: organizationIdentifier,
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { loading, data, error } = useQuery<GetOrganizationDashboardData, GetOrganizationDashboardVariables>(
    getOrganizationDashboardQuery,
    { variables }
  );
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

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const projects = state.organization?.projects.edges.map((edge) => edge.node) ?? [];
  return (
    <>
      <Main>
        <Typography variant="h6" gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={10}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: (theme) => theme.spacing(2) }}>
              {projects.map((project) => (
                <ProjectCard identifier={project.identifier} name={project.name} description={project.description} />
              ))}
            </Box>
            {state.organization ? (
              <TablePagination
                component="div"
                count={state.organization.projects.pageInfo.count}
                page={state.page}
                onPageChange={handlePageChange}
                rowsPerPage={state.rowsPerPage}
                rowsPerPageOptions={[state.rowsPerPage]}
              />
            ) : null}
          </Grid>
          <Grid item xs={2}>
            {state.organization ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
                <CreatedOn profile={state.organization.createdBy} date={new Date(state.organization.createdOn)} />
                <LastModifiedOn
                  profile={state.organization.lastModifiedBy}
                  date={new Date(state.organization.lastModifiedOn)}
                />
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </Main>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
