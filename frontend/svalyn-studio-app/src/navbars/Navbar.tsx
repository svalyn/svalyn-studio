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

import { gql, useQuery } from '@apollo/client';
import HelpIcon from '@mui/icons-material/Help';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import { useContext, useEffect, useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { getCookie } from '../cookies/getCookie';
import { Svalyn } from '../icons/Svalyn';
import { PaletteContext } from '../palette/PaletteContext';
import { PaletteContextValue } from '../palette/PaletteContext.types';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import { GetViewerData, GetViewerVariables, NavbarProps, NavbarState } from './Navbar.types';
const { VITE_BACKEND_URL } = import.meta.env;

const getViewerQuery = gql`
  query getViewer {
    viewer {
      name
      username
      imageUrl
      unreadNotificationsCount
    }
  }
`;

export const Navbar = ({ children }: NavbarProps) => {
  const [state, setState] = useState<NavbarState>({
    viewer: null,
    anchorElement: null,
    redirectToLogin: false,
    message: null,
  });

  const { loading, data, error } = useQuery<GetViewerData, GetViewerVariables>(getViewerQuery);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const { viewer } = data;
        setState((prevState) => ({ ...prevState, viewer }));
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const { openPalette }: PaletteContextValue = useContext<PaletteContextValue>(PaletteContext);

  const handleOnSearchClick: React.MouseEventHandler<HTMLButtonElement> = () => openPalette();

  const handleOpenUserMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const { currentTarget } = event;
    setState((prevState) => ({ ...prevState, anchorElement: currentTarget }));
  };
  const handleCloseUserMenu = () => setState((prevState) => ({ ...prevState, anchorElement: null }));

  const handleLogout: React.MouseEventHandler<HTMLLIElement> = () => {
    const csrfToken = getCookie('XSRF-TOKEN');

    fetch(`${VITE_BACKEND_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'X-XSRF-TOKEN': csrfToken,
      },
    }).then(() => {
      setState((prevState) => ({ ...prevState, redirectToLogin: true }));
    });
  };

  if (state.redirectToLogin) {
    return <Navigate to="/login" />;
  }

  var isApple = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  return (
    <>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton component={RouterLink} to="/" sx={{ marginRight: '1.5rem' }}>
            <Svalyn />
          </IconButton>
          {children}
          {state.viewer !== null ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: (theme) => theme.spacing(2),
                  marginLeft: 'auto',
                }}
              >
                <Button
                  sx={{ color: 'inherit', border: (theme) => `1px solid ${theme.palette.background.paper}` }}
                  startIcon={<SearchIcon fontSize="small" color="inherit" />}
                  onClick={handleOnSearchClick}
                  size="small"
                >
                  Search...
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      border: (theme) => `1px solid ${theme.palette.background.paper}`,
                      borderRadius: '3px',
                      marginLeft: (theme) => theme.spacing(4),
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      lineHeight: '20px',
                      padding: '0px 4px',
                      fontFamily: 'sans-serif',
                      opacity: 0.7,
                    }}
                  >
                    {isApple ? '⌘ ' : 'Ctrl '}+ K
                  </Box>
                </Button>
                <IconButton component={RouterLink} to="/notifications" size="small" color="inherit">
                  <Badge badgeContent={state.viewer.unreadNotificationsCount} color="secondary">
                    <NotificationsNoneIcon />
                  </Badge>
                </IconButton>
                <IconButton onClick={handleOpenUserMenu}>
                  <Avatar alt={state.viewer.name} src={state.viewer.imageUrl} sx={{ width: 24, height: 24 }} />
                </IconButton>
                <Menu
                  open={Boolean(state.anchorElement)}
                  anchorEl={state.anchorElement}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  onClose={handleCloseUserMenu}
                  keepMounted
                >
                  <ListItem sx={{ paddingTop: '0', paddingBottom: '0' }}>
                    <ListItemText primary="Signed in as" secondary={state.viewer.name} />
                  </ListItem>
                  <MenuItem component={RouterLink} to="/" onClick={handleCloseUserMenu}>
                    <ListItemIcon>
                      <HomeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Dashboard</ListItemText>
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to={`/profiles/${state.viewer.username}`}
                    onClick={handleCloseUserMenu}
                  >
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
              </Box>
            </>
          ) : null}
        </Toolbar>
      </AppBar>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
