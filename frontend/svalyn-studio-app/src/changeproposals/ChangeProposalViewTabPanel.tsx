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

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, generatePath, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { ChangeProposalViewTabPanelProps, ChangeProposalViewTabPanelState } from './ChangeProposalViewTabPanel.types';
import { ChangeProposalFiles } from './files/ChangeProposalFiles';
import { ChangeProposalOverview } from './overview/ChangeProposalOverview';

const a11yProps = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
};

export const ChangeProposalViewTabPanel = ({ changeProposal }: ChangeProposalViewTabPanelProps) => {
  const location = useLocation();
  const overviewMatch = matchPath('/changeproposals/:changeProposalId', location.pathname);
  const filesMatch = matchPath('/changeproposals/:changeProposalId/files', location.pathname);
  let activeTab = 0;
  if (filesMatch) {
    activeTab = 1;
  }

  const [state, setState] = useState<ChangeProposalViewTabPanelState>({ activeTab });
  const navigate = useNavigate();
  useEffect(() => {
    if (state.activeTab === 0 && !overviewMatch) {
      const path = generatePath('/changeproposals/:changeProposalId', { changeProposalId: changeProposal.id });
      navigate(path);
    } else if (state.activeTab === 1 && !filesMatch) {
      const path = generatePath('/changeproposals/:changeProposalId/files', { changeProposalId: changeProposal.id });
      navigate(path);
    }
  }, [state.activeTab]);

  const handleTabChanged = (_: React.SyntheticEvent, newValue: number) =>
    setState((prevState) => ({ ...prevState, activeTab: newValue }));

  return (
    <div>
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
          <Link
            variant="h5"
            underline="hover"
            component={RouterLink}
            to={`/orgs/${changeProposal.project.organization.identifier}`}
          >
            {changeProposal.project.organization.name}
          </Link>
          <Typography variant="h5">/</Typography>
          <Link
            variant="h5"
            underline="hover"
            component={RouterLink}
            to={`/projects/${changeProposal.project.identifier}`}
          >
            {changeProposal.project.name}
          </Link>
          <Typography variant="h5">/</Typography>
          <Typography
            variant="h5"
            sx={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {changeProposal.name}
          </Typography>
        </Box>
        <Tabs value={state.activeTab} onChange={handleTabChanged}>
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Files Changed" {...a11yProps(1)} />
        </Tabs>
      </Toolbar>
      <div role="tabpanel" hidden={state.activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
        {state.activeTab === 0 && (
          <ChangeProposalOverview
            changeProposalId={changeProposal.id}
            role={changeProposal.project.organization.role}
          />
        )}
      </div>
      <div role="tabpanel" hidden={state.activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
        {state.activeTab === 1 && (
          <ChangeProposalFiles changeProposalId={changeProposal.id} role={changeProposal.project.organization.role} />
        )}
      </div>
    </div>
  );
};
