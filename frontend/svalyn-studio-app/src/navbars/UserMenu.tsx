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
import HelpIcon from '@mui/icons-material/Help';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuthentication } from '../login/useAuthentication';
import { UserMenuProps, UserMenuState } from './UserMenu.types';

export const UserMenu = ({ viewer, onClose, ...props }: UserMenuProps) => {
  const [state, setState] = useState<UserMenuState>({
    redirectToLogin: false,
  });

  const handleCloseUserMenu: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (onClose) {
      onClose(event, 'backdropClick');
    }
  };

  const { logout } = useAuthentication();
  const handleLogout: React.MouseEventHandler<HTMLLIElement> = () => {
    logout().then(() => {
      setState((prevState) => ({ ...prevState, redirectToLogin: true }));
    });
  };

  if (state.redirectToLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <Menu onClose={onClose} {...props}>
      <ListItem sx={{ paddingTop: '0', paddingBottom: '0' }}>
        <ListItemAvatar sx={{ minWidth: (theme) => theme.spacing(4.5) }}>
          <Avatar alt={viewer.name} src={viewer.imageUrl} sx={{ width: 24, height: 24 }} />
        </ListItemAvatar>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body1" noWrap>
            {viewer.name} ({viewer.username})
          </Typography>
          <Link
            variant="caption"
            color="inherit"
            underline="hover"
            rel="noreferrer"
            target="_blank"
            href={`https://github.com/svalyn/svalyn-studio/commit/${__GIT_COMMIT_HASH__}`}
          >
            App version: {__GIT_COMMIT_HASH__.substring(0, 7)}
          </Link>
        </Box>
      </ListItem>
      <MenuItem component={RouterLink} to="/" onClick={handleCloseUserMenu}>
        <ListItemIcon>
          <HomeIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Dashboard</ListItemText>
      </MenuItem>
      <MenuItem component={RouterLink} to={`/profiles/${viewer.username}`} onClick={handleCloseUserMenu}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>
      <MenuItem component={RouterLink} to="/invitations" onClick={handleCloseUserMenu}>
        <ListItemIcon>
          <MailOutlineIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Invitations</ListItemText>
      </MenuItem>
      <MenuItem component={RouterLink} to="/settings" onClick={handleCloseUserMenu}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>
      {viewer.role === 'ADMIN' ? (
        <MenuItem component={RouterLink} to="/admin" onClick={handleCloseUserMenu}>
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Admin Panel</ListItemText>
        </MenuItem>
      ) : null}
      <MenuItem component={RouterLink} to="/help" onClick={handleCloseUserMenu}>
        <ListItemIcon>
          <HelpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Help</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Sign out</ListItemText>
      </MenuItem>
    </Menu>
  );
};
