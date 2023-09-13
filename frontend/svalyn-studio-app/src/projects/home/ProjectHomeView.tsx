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
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { CreatedOn } from '../../widgets/CreatedOn';
import { LastModifiedOn } from '../../widgets/LastModifiedOn';
import { useProject } from '../useProject';
import { ProjectBranchCard } from './ProjectBranchCard';
import { GetProjectHomeData, GetProjectHomeVariables } from './ProjectHomeView.types';
import { ProjectReadMeCard } from './ProjectReadMeCard';

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
      }
    }
  }
`;

export const ProjectHomeView = () => {
  const {
    identifier: projectIdentifier,
    organization: { role },
  } = useProject();
  const { enqueueSnackbar } = useSnackbar();

  const variables: GetProjectHomeVariables = { identifier: projectIdentifier };
  const { data, error, refetch } = useQuery<GetProjectHomeData, GetProjectHomeVariables>(getProjectHomeQuery, {
    variables,
  });
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  const handleReadMeUpdate = () => refetch(variables);

  if (!data || !data.viewer.project) {
    return null;
  }

  return (
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
        <Typography variant="h4">{data.viewer.project.name}</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={9}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
            <ProjectBranchCard />
            <ProjectReadMeCard
              projectIdentifier={projectIdentifier}
              readMe={data.viewer.project.readMe}
              role={role}
              onReadMeUpdate={handleReadMeUpdate}
            />
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2">{data.viewer.project.description}</Typography>
            </Box>
            <CreatedOn profile={data.viewer.project.createdBy} date={new Date(data.viewer.project.createdOn)} />
            <LastModifiedOn
              profile={data.viewer.project.lastModifiedBy}
              date={new Date(data.viewer.project.lastModifiedOn)}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
