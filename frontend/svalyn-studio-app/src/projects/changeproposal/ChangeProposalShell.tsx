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
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useRouteMatch } from '../../hooks/useRouteMatch';
import { useProject } from '../useProject';
import {
  ChangeProposalShellProps,
  GetChangeProposalData,
  GetChangeProposalVariables,
} from './ChangeProposalShell.types';

const getChangeProposalQuery = gql`
  query getChangeProposal($id: ID!) {
    viewer {
      changeProposal(id: $id) {
        id
        name
      }
    }
  }
`;

const a11yProps = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
};

const patterns = [
  '/projects/:projectIdentifier/changeproposals/:changeProposalIdentifier',
  '/projects/:projectIdentifier/changeproposals/:changeProposalIdentifier/files',
];

export const ChangeProposalShell = ({ children }: ChangeProposalShellProps) => {
  const { identifier: projectIdentifier } = useProject();
  const { changeProposalIdentifier } = useParams();
  const routeMatch = useRouteMatch(patterns);
  const currentTab = routeMatch?.pattern?.path;

  const variables: GetChangeProposalVariables = { id: changeProposalIdentifier ?? '' };
  const { data, error } = useQuery<GetChangeProposalData, GetChangeProposalVariables>(getChangeProposalQuery, {
    variables,
  });

  if (!data) {
    return null;
  }
  if (!data.viewer.changeProposal) {
    return <div>Not found</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        variant="dense"
        sx={{
          backgroundColor: 'white',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: (theme) => theme.spacing(1),
            marginRight: (theme) => theme.spacing(4),
          }}
        >
          <Typography
            variant="h5"
            sx={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {data.viewer.changeProposal.name}
          </Typography>
        </Box>
        <Tabs value={currentTab}>
          <Tab
            label="Overview"
            component={RouterLink}
            to={`/projects/${projectIdentifier}/changeproposals/${changeProposalIdentifier}`}
            value="/projects/:projectIdentifier/changeproposals/:changeProposalIdentifier"
            {...a11yProps(0)}
          />
          <Tab
            label="Files Changed"
            component={RouterLink}
            to={`/projects/${projectIdentifier}/changeproposals/${changeProposalIdentifier}/files`}
            value="/projects/:projectIdentifier/changeproposals/:changeProposalIdentifier/files"
            {...a11yProps(1)}
          />
        </Tabs>
      </Toolbar>

      {children}
    </Box>
  );
};
