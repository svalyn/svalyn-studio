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

import DifferenceIcon from '@mui/icons-material/Difference';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { ProjectBranchCardProps, ProjectEmptyBranchCardProps } from './ProjectBranchCard.types';

export const ProjectBranchCard = ({ projectIdentifier, branch }: ProjectBranchCardProps) => {
  if (!branch.change) {
    return <ProjectEmptyBranchCard projectIdentifier={projectIdentifier} branch={branch} />;
  }

  return (
    <Paper variant="outlined">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: (theme) => theme.spacing(1),
          px: (theme) => theme.spacing(2),
          py: (theme) => theme.spacing(1),
        }}
      >
        <Tooltip title={branch.change.lastModifiedBy.name}>
          <Avatar
            component={RouterLink}
            to={`/profile/${branch.change.lastModifiedBy.username}`}
            alt={branch.change.lastModifiedBy.name}
            src={branch.change.lastModifiedBy.imageUrl}
            sx={{ width: 24, height: 24 }}
          />
        </Tooltip>
        <Link component={RouterLink} to={`/profile/${branch.change.lastModifiedBy.username}`}>
          {branch.change.lastModifiedBy.username}
        </Link>
        <Typography variant="subtitle1">{branch.change.name}</Typography>
      </Box>
      <Divider />
      <Table size="small">
        <TableBody>
          {branch.change.resources.edges
            .map((edge) => edge.node)
            .map((resource) => {
              const fullpath = resource.path.length > 0 ? `${resource.path}/${resource.name}` : resource.name;
              return (
                <TableRow key={fullpath}>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: (theme) => theme.spacing(1),
                        alignItems: 'center',
                      }}
                    >
                      <InsertDriveFileIcon fontSize="small" />
                      <Link
                        component={RouterLink}
                        to={`/projects/${projectIdentifier}/changes/${branch.change?.id}/resources/${fullpath}`}
                      >
                        {fullpath}
                      </Link>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Paper>
  );
};

const ProjectEmptyBranchCard = ({ projectIdentifier, branch }: ProjectEmptyBranchCardProps) => {
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
        <Typography variant="subtitle1">{branch.name}</Typography>
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
          There are no resource in the branch {branch.name}, please create and integrate a change proposal to add
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
