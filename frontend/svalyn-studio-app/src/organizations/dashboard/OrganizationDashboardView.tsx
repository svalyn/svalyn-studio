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
import ClassIcon from '@mui/icons-material/Class';
import TimelineIcon from '@mui/icons-material/Timeline';
import Box, { BoxProps } from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ActivityTimeline } from '../../activity/ActivityTimeline';
import { CreatedOn } from '../../widgets/CreatedOn';
import { LastModifiedOn } from '../../widgets/LastModifiedOn';
import { useOrganization } from '../useOrganization';
import {
  ActivityAreaProps,
  GetOrganizationDashboardData,
  GetOrganizationDashboardVariables,
  OrganizationDashboardViewState,
  ProjectsAreaProps,
} from './OrganizationDashboardView.types';
import { ProjectCard } from './ProjectCard';

const getOrganizationDashboardQuery = gql`
  query getOrganizationDashboard($identifier: ID!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      organization(identifier: $identifier) {
        createdOn
        createdBy {
          name
          username
          imageUrl
        }
        lastModifiedOn
        lastModifiedBy {
          name
          username
          imageUrl
        }
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

export const OrganizationDashboardView = () => {
  const {
    organization: { identifier: organizationIdentifier },
  } = useOrganization();
  const [state, setState] = useState<OrganizationDashboardViewState>({
    organization: null,
    page: 0,
    rowsPerPage: 10,
  });

  const { enqueueSnackbar } = useSnackbar();

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
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  }, [loading, data, error]);

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  return (
    <Main>
      <Grid container spacing={2}>
        <Grid item xs={10}>
          {state.organization ? (
            <>
              {state.organization.projects.edges.length > 0 ? (
                <ProjectsArea
                  projects={state.organization.projects.edges.map((edge) => edge.node)}
                  pageInfo={state.organization.projects.pageInfo}
                  page={state.page}
                  rowsPerPage={state.rowsPerPage}
                  onPageChange={handlePageChange}
                />
              ) : (
                <EmptyProjectsArea />
              )}
              <ActivityArea activityEntries={state.organization.activityEntries.edges.map((edge) => edge.node)} />
            </>
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
  );
};

const ProjectsArea = ({ projects, pageInfo, page, rowsPerPage, onPageChange }: ProjectsAreaProps) => {
  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: (theme) => theme.spacing(1),
          paddingBottom: (theme) => theme.spacing(2),
        }}
      >
        <ClassIcon fontSize="small" />
        <Typography variant="h6">Projects</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: (theme) => theme.spacing(2) }}>
        {projects.map((project) => (
          <ProjectCard
            key={project.identifier}
            identifier={project.identifier}
            name={project.name}
            description={project.description}
          />
        ))}
      </Box>
      <TablePagination
        component="div"
        count={pageInfo.count}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
      />
    </div>
  );
};

const EmptyProjectsArea = () => {
  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: (theme) => theme.spacing(1),
          paddingBottom: (theme) => theme.spacing(2),
        }}
      >
        <ClassIcon fontSize="small" />
        <Typography variant="h6">Projects</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: (theme) => theme.spacing(30),
        }}
      >
        <Typography variant="h6">No project found, create a new project to get started </Typography>
      </Box>
    </div>
  );
};

const ActivityArea = ({ activityEntries }: ActivityAreaProps) => {
  return (
    <div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: (theme) => theme.spacing(1),
          paddingBottom: (theme) => theme.spacing(2),
        }}
      >
        <TimelineIcon fontSize="small" />
        <Typography variant="h6">Activity</Typography>
      </Box>
      <ActivityTimeline activityEntries={activityEntries} />
    </div>
  );
};
