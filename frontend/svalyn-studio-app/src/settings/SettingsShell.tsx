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

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useRouteMatch } from '../hooks/useRouteMatch';
import { Navbar } from '../navbars/Navbar';
import { SettingsShellProps } from './SettingsShell.types';

const patterns = ['/settings', '/settings/authentication-tokens'];

export const SettingsShell = ({ children }: SettingsShellProps) => {
  const routeMatch = useRouteMatch(patterns);
  const currentTab = routeMatch?.pattern.path;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar>
        <Breadcrumbs sx={{ color: 'inherit' }}>
          <Typography
            color="inherit"
            fontWeight={800}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(0.5) }}
          >
            <SettingsIcon fontSize="inherit" /> Settings
          </Typography>
        </Breadcrumbs>
      </Navbar>

      <Box sx={{ display: 'grid', gridTemplateRows: '1fr', gridTemplateColumns: 'min-content 1fr', flexGrow: 1 }}>
        <Paper
          elevation={0}
          square
          sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}`, minWidth: (theme) => theme.spacing(30) }}
        >
          <List disablePadding>
            <ListItem disablePadding disableGutters>
              <ListItemButton component={RouterLink} to="/settings" selected={currentTab === '/settings'}>
                <ListItemIcon sx={{ minWidth: 0, marginRight: (theme) => theme.spacing(1), justifyContent: 'center' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding disableGutters>
              <ListItemButton
                component={RouterLink}
                to="/settings/authentication-tokens"
                selected={currentTab === '/settings/authentication-tokens'}
              >
                <ListItemIcon sx={{ minWidth: 0, marginRight: (theme) => theme.spacing(1), justifyContent: 'center' }}>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Authentication Tokens" />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>

        {children}
      </Box>
    </Box>
  );
};
