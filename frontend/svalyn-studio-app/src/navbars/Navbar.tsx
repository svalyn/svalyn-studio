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
import PersonIcon from '@mui/icons-material/Person';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { getCookie } from '../cookies/getCookie';
import { Svalyn } from '../icons/Svalyn';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import { GetViewerData, GetViewerVariables, NavbarProps, NavbarState } from './Navbar.types';
const { VITE_BACKEND_URL } = import.meta.env;

const getViewerQuery = gql`
  query getViewer {
    viewer {
      name
      imageUrl
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
                  <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
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
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
