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

import ClassIcon from '@mui/icons-material/Class';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import DifferenceIcon from '@mui/icons-material/Difference';
import SettingsIcon from '@mui/icons-material/Settings';
import TagIcon from '@mui/icons-material/Tag';
import TimelineIcon from '@mui/icons-material/Timeline';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useRouteMatch } from '../hooks/useRouteMatch';
import { useProject } from './useProject';

const patterns = [
  '/projects/:projectIdentifier',
  '/projects/:projectIdentifier/activity',
  '/projects/:projectIdentifier/changeproposals',
  '/projects/:projectIdentifier/changeproposals/:changeProposalIdentifier',
  '/projects/:projectIdentifier/changeproposals/:changeProposalIdentifier/files',
  '/projects/:projectIdentifier/new/changeproposal',
  '/projects/:projectIdentifier/tags',
  '/projects/:projectIdentifier/settings',
  '/projects/:projectIdentifier/changes/:changeId/resources/*',
];

export const ProjectBreadcrumbs = () => {
  const routeMatch = useRouteMatch(patterns);
  const currentTab = routeMatch?.pattern?.path;
  return (
    <Breadcrumbs aria-label="breadcrumbs" sx={{ color: 'inherit' }}>
      <OrganizationBreadcrumbEntry />
      <ProjectBreadcrumbEntry />
      {currentTab !== '/projects/:projectIdentifier' &&
      currentTab !== '/projects/:projectIdentifier/changes/:changeId/resources/*' ? (
        <AdditionalBreadcrumbEntry />
      ) : null}
    </Breadcrumbs>
  );
};

const OrganizationBreadcrumbEntry = () => {
  const project = useProject();

  return (
    <Link
      component={RouterLink}
      to={`/orgs/${project.organization.identifier}`}
      color="inherit"
      underline="hover"
      fontWeight={800}
      sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(0.5) }}
    >
      <CorporateFareIcon fontSize="inherit" />
      {project.organization.name}
    </Link>
  );
};

const ProjectBreadcrumbEntry = () => {
  const project = useProject();
  const routeMatch = useRouteMatch(patterns);
  const currentTab = routeMatch?.pattern?.path;

  if (currentTab === '/projects/:projectIdentifier') {
    return (
      <Typography
        color="inherit"
        fontWeight={800}
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(0.5) }}
      >
        <ClassIcon fontSize="inherit" />
        {project.name}
      </Typography>
    );
  }

  return (
    <Link
      component={RouterLink}
      to={`/projects/${project.identifier}`}
      color="inherit"
      underline="hover"
      fontWeight={800}
      sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(0.5) }}
    >
      <ClassIcon fontSize="inherit" />
      {project.name}
    </Link>
  );
};

const AdditionalBreadcrumbEntry = () => {
  const routeMatch = useRouteMatch(patterns);
  const currentTab = routeMatch?.pattern?.path;

  let tabBreadcrumbEntry: { label: string; icon: JSX.Element } | null = null;
  if (currentTab === '/projects/:projectIdentifier/activity') {
    tabBreadcrumbEntry = {
      label: 'Activity',
      icon: <TimelineIcon fontSize="inherit" />,
    };
  } else if (currentTab?.startsWith('/projects/:projectIdentifier/changeproposals')) {
    tabBreadcrumbEntry = {
      label: 'Change Proposals',
      icon: <DifferenceIcon fontSize="inherit" />,
    };
  } else if (currentTab === '/projects/:projectIdentifier/new/changeproposal') {
    tabBreadcrumbEntry = {
      label: 'New Change Proposal',
      icon: <DifferenceIcon fontSize="inherit" />,
    };
  } else if (currentTab === '/projects/:projectIdentifier/tags') {
    tabBreadcrumbEntry = {
      label: 'Tags',
      icon: <TagIcon fontSize="inherit" />,
    };
  } else if (currentTab === '/projects/:projectIdentifier/settings') {
    tabBreadcrumbEntry = {
      label: 'Settings',
      icon: <SettingsIcon fontSize="inherit" />,
    };
  }

  if (tabBreadcrumbEntry) {
    const { label, icon } = tabBreadcrumbEntry;
    return (
      <Typography
        color="inherit"
        fontWeight={800}
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(0.5) }}
      >
        {icon}
        {label}
      </Typography>
    );
  }

  return null;
};
