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

import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import TagIcon from '@mui/icons-material/Tag';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Link as RouterLink } from 'react-router-dom';
import { OrganizationTabsProps } from './OrganizationTabs.types';
import { useRouteMatch } from './useRouteMatch';

const patterns = [
  '/orgs/:organizationId',
  '/orgs/:organizationId/tags',
  '/orgs/:organizationId/members',
  '/orgs/:organizationId/settings',
];

export const OrganizationTabs = ({ organizationIdentifier, sx }: OrganizationTabsProps) => {
  const routeMatch = useRouteMatch(patterns);
  const currentTab = routeMatch?.pattern?.path;

  return (
    <Tabs value={currentTab} sx={sx}>
      <Tab
        label="Dashboard"
        icon={<HomeIcon />}
        value="/orgs/:organizationId"
        to={`/orgs/${organizationIdentifier}`}
        component={RouterLink}
        iconPosition="start"
        sx={{ minHeight: 0 }}
      />
      <Tab
        label="Tags"
        icon={<TagIcon />}
        value="/orgs/:organizationId/tags"
        to={`/orgs/${organizationIdentifier}/tags`}
        component={RouterLink}
        iconPosition="start"
        sx={{ minHeight: 0 }}
      />
      <Tab
        label="Members"
        icon={<PersonIcon />}
        value="/orgs/:organizationId/members"
        to={`/orgs/${organizationIdentifier}/members`}
        component={RouterLink}
        iconPosition="start"
        sx={{ minHeight: 0 }}
      />
      <Tab
        label="Settings"
        icon={<SettingsIcon />}
        value="/orgs/:organizationId/settings"
        to={`/orgs/${organizationIdentifier}/settings`}
        component={RouterLink}
        iconPosition="start"
        sx={{ minHeight: 0 }}
      />
    </Tabs>
  );
};
