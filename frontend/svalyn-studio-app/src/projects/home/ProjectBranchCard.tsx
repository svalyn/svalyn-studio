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
import AltRouteIcon from '@mui/icons-material/AltRoute';
import DifferenceIcon from '@mui/icons-material/Difference';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useProject } from '../useProject';
import { BranchButton } from './BranchButton';
import { ChangeCard } from './ChangeCard';
import {
  GetProjectBranchesData,
  GetProjectBranchesVariables,
  ProjectBranchCardProps,
  ProjectEmptyBranchCardProps,
} from './ProjectBranchCard.types';

const getProjectBranchesQuery = gql`
  query getProjectBranches($projectIdentifier: ID!, $branchName: String!) {
    viewer {
      project(identifier: $projectIdentifier) {
        branches(page: 0, rowsPerPage: 1) {
          pageInfo {
            count
          }
        }
        branch(name: $branchName) {
          change {
            id
            name
            resources {
              edges {
                node {
                  path
                  name
                }
              }
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
    }
  }
`;

export const ProjectBranchCard = ({}: ProjectBranchCardProps) => {
  const { identifier: projectIdentifier } = useProject();
  const { branchName } = useParams();
  const resolvedBranchName = branchName ?? 'main';

  const variables: GetProjectBranchesVariables = {
    projectIdentifier,
    branchName: resolvedBranchName,
  };
  const { data, error } = useQuery<GetProjectBranchesData, GetProjectBranchesVariables>(getProjectBranchesQuery, {
    variables,
  });

  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  if (!data) {
    return null;
  }

  if (!data.viewer.project.branch.change) {
    return <ProjectEmptyBranchCard branchName={resolvedBranchName} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(1) }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: (theme) => theme.spacing(2) }}>
        <BranchButton branchName={resolvedBranchName} />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: (theme) => theme.spacing(0.5), alignItems: 'center' }}>
          <AltRouteIcon sx={{ fontSize: 16 }} />
          <span>{data.viewer.project.branches.pageInfo.count} branches</span>
        </Box>
      </Box>
      <ChangeCard change={data.viewer.project.branch.change} />
    </Box>
  );
};

const ProjectEmptyBranchCard = ({ branchName }: ProjectEmptyBranchCardProps) => {
  const { identifier: projectIdentifier } = useProject();
  return (
    <Paper variant="outlined">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: (theme) => theme.spacing(2),
          py: (theme) => theme.spacing(1),
        }}
      >
        <Typography variant="subtitle1">{branchName}</Typography>
      </Box>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: (theme) => theme.spacing(10),
          py: (theme) => theme.spacing(6),
          gap: (theme) => theme.spacing(2),
          minHeight: (theme) => theme.spacing(20),
        }}
      >
        <Typography align="center">
          There are no resource in the branch {branchName}, please create and integrate a change proposal to add
          resources to the project
        </Typography>
        <Button
          variant="contained"
          startIcon={<DifferenceIcon />}
          component={RouterLink}
          to={`/projects/${projectIdentifier}/new/changeproposal`}
        >
          New change proposal
        </Button>
      </Box>
    </Paper>
  );
};
