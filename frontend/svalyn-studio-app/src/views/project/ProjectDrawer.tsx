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

import DifferenceIcon from '@mui/icons-material/Difference';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import TagIcon from '@mui/icons-material/Tag';
import TimelineIcon from '@mui/icons-material/Timeline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { ProjectDrawerProps } from './ProjectDrawer.types';

const CompactDrawer = styled('div')(({ theme }) => ({
  width: '64px',
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
}));

export const ProjectDrawer = ({ projectIdentifier, selectedPanel }: ProjectDrawerProps) => {
  return (
    <CompactDrawer>
      <List disablePadding>
        <ListItem selected={selectedPanel === 'Home'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={RouterLink}
            to={`/projects/${projectIdentifier}`}
            sx={{ minHeight: 48, justifyContent: 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 'auto', justifyContent: 'center' }}>
              <HomeIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        <ListItem selected={selectedPanel === 'Activity'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={RouterLink}
            to={`/projects/${projectIdentifier}/activity`}
            sx={{ minHeight: 48, justifyContent: 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 'auto', justifyContent: 'center' }}>
              <TimelineIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        <ListItem selected={selectedPanel === 'ChangeProposals'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={RouterLink}
            to={`/projects/${projectIdentifier}/changeproposals`}
            sx={{ minHeight: 48, justifyContent: 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 'auto', justifyContent: 'center' }}>
              <DifferenceIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        <ListItem selected={selectedPanel === 'Tags'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={RouterLink}
            to={`/projects/${projectIdentifier}/tags`}
            sx={{ minHeight: 48, justifyContent: 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 'auto', justifyContent: 'center' }}>
              <TagIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        <ListItem selected={selectedPanel === 'Settings'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={RouterLink}
            to={`/projects/${projectIdentifier}/settings`}
            sx={{ minHeight: 48, justifyContent: 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 'auto', justifyContent: 'center' }}>
              <SettingsIcon />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      </List>
    </CompactDrawer>
  );
};
