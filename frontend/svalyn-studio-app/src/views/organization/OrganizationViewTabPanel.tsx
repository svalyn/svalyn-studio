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

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { generatePath, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { OrganizationDashboard } from './dashboard/OrganizationDashboard';
import { OrganizationMembers } from './members/OrganizationMembers';
import { NewProjectDialog } from './NewProjectDialog';
import { OrganizationViewTabPanelProps, OrganizationViewTabPanelState } from './OrganizationViewTabPanel.types';
import { OrganizationSettings } from './settings/OrganizationSettings';
import { OrganizationTags } from './tags/OrganizationTags';

const a11yProps = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
};

export const OrganizationViewTabPanel = ({ organization }: OrganizationViewTabPanelProps) => {
  const location = useLocation();
  const dashboardMatch = matchPath('/orgs/:organizationId', location.pathname);
  const tagsMatch = matchPath('/orgs/:organizationId/tags', location.pathname);
  const membersMatch = matchPath('/orgs/:organizationId/members', location.pathname);
  const settingsMatch = matchPath('/orgs/:organizationId/settings', location.pathname);
  let activeTab = 0;
  if (tagsMatch) {
    activeTab = 1;
  } else if (membersMatch) {
    activeTab = 2;
  } else if (settingsMatch) {
    activeTab = 3;
  }

  const [state, setState] = useState<OrganizationViewTabPanelState>({
    activeTab: activeTab,
    newProjectDialogOpen: false,
  });

  useEffect(() => {
    const dashboardMatch = matchPath('/orgs/:organizationId', location.pathname);
    const tagsMatch = matchPath('/orgs/:organizationId/tags', location.pathname);
    const membersMatch = matchPath('/orgs/:organizationId/members', location.pathname);
    const settingsMatch = matchPath('/orgs/:organizationId/settings', location.pathname);
    if (dashboardMatch && state.activeTab !== 0) {
      setState((prevState) => ({ ...prevState, activeTab: 0 }));
    } else if (tagsMatch && state.activeTab !== 1) {
      setState((prevState) => ({ ...prevState, activeTab: 1 }));
    } else if (membersMatch && state.activeTab !== 2) {
      setState((prevState) => ({ ...prevState, activeTab: 2 }));
    } else if (settingsMatch && state.activeTab !== 3) {
      setState((prevState) => ({ ...prevState, activeTab: 3 }));
    }
  }, [location]);

  const navigate = useNavigate();
  useEffect(() => {
    if (state.activeTab === 0 && !dashboardMatch) {
      const path = generatePath('/orgs/:identifier', { identifier: organization.identifier });
      navigate(path);
    } else if (state.activeTab === 1 && !tagsMatch) {
      const path = generatePath('/orgs/:identifier/tags', { identifier: organization.identifier });
      navigate(path);
    } else if (state.activeTab === 2 && !membersMatch) {
      const path = generatePath('/orgs/:identifier/members', { identifier: organization.identifier });
      navigate(path);
    } else if (state.activeTab === 3 && !settingsMatch) {
      const path = generatePath('/orgs/:identifier/settings', { identifier: organization.identifier });
      navigate(path);
    }
  }, [state.activeTab]);

  const handleTabChanged = (_: React.SyntheticEvent, newValue: number) =>
    setState((prevState) => ({ ...prevState, activeTab: newValue }));
  const openNewProjectDialog: React.MouseEventHandler<HTMLButtonElement> = () =>
    setState((prevState) => ({ ...prevState, newProjectDialogOpen: true }));
  const closeNewProjectDialog = () => setState((prevState) => ({ ...prevState, newProjectDialogOpen: false }));

  return (
    <>
      <div>
        <Toolbar
          sx={{
            backgroundColor: 'white',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h4" sx={{ marginRight: '2rem' }}>
            {organization.name}
          </Typography>
          <Tabs value={state.activeTab} onChange={handleTabChanged}>
            <Tab label="Dashboard" {...a11yProps(0)} />
            <Tab label="Tags" {...a11yProps(1)} />
            <Tab label="Members" {...a11yProps(2)} />
            <Tab label="Settings" {...a11yProps(3)} />
          </Tabs>
          <Button
            variant="outlined"
            sx={{ marginLeft: 'auto' }}
            size="small"
            endIcon={<AddIcon />}
            onClick={openNewProjectDialog}
            disabled={organization.role === 'NONE'}
          >
            New Project
          </Button>
        </Toolbar>
        <div role="tabpanel" hidden={state.activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {state.activeTab === 0 && <OrganizationDashboard organizationIdentifier={organization.identifier} />}
        </div>
        <div role="tabpanel" hidden={state.activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          {state.activeTab === 1 && (
            <OrganizationTags organizationIdentifier={organization.identifier} role={organization.role} />
          )}
        </div>
        <div role="tabpanel" hidden={state.activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
          {state.activeTab === 2 && (
            <OrganizationMembers organizationIdentifier={organization.identifier} role={organization.role} />
          )}
        </div>
        <div role="tabpanel" hidden={state.activeTab !== 3} id="tabpanel-3" aria-labelledby="tab-3">
          {state.activeTab === 3 && (
            <OrganizationSettings organizationIdentifier={organization.identifier} role={organization.role} />
          )}
        </div>
      </div>
      {state.newProjectDialogOpen ? (
        <NewProjectDialog
          organizationIdentifier={organization.identifier}
          open={state.newProjectDialogOpen}
          onClose={closeNewProjectDialog}
        />
      ) : null}
    </>
  );
};
