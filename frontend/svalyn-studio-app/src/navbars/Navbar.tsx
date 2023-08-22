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

import { gql, useQuery } from '@apollo/client';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import { useSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Svalyn } from '../icons/Svalyn';
import { PaletteContext } from '../palette/PaletteContext';
import { PaletteContextValue } from '../palette/PaletteContext.types';
import { GetViewerData, GetViewerVariables, NavbarProps, NavbarState } from './Navbar.types';
import { SearchButton } from './SearchButton';
import { UserMenu } from './UserMenu';

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
  });

  const { enqueueSnackbar } = useSnackbar();

  const { loading, data, error } = useQuery<GetViewerData, GetViewerVariables>(getViewerQuery);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const { viewer } = data;
        setState((prevState) => ({ ...prevState, viewer }));
      }
      if (error) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  }, [loading, data, error]);

  const { openPalette }: PaletteContextValue = useContext<PaletteContextValue>(PaletteContext);

  const handleOnSearchClick: React.MouseEventHandler<HTMLButtonElement> = () => openPalette();

  const handleOpenUserMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const { currentTarget } = event;
    setState((prevState) => ({ ...prevState, anchorElement: currentTarget }));
  };
  const handleCloseUserMenu = () => setState((prevState) => ({ ...prevState, anchorElement: null }));

  return (
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
              <Link
                component={RouterLink}
                to="/domains"
                color="inherit"
                underline="hover"
                fontWeight={800}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: (theme) => theme.spacing(0.5),
                }}
              >
                <HubOutlinedIcon fontSize="inherit" />
                Domains
              </Link>
              <SearchButton onClick={handleOnSearchClick} />
              <IconButton component={RouterLink} to="/notifications" size="small" color="inherit">
                <Badge badgeContent={state.viewer.unreadNotificationsCount} color="secondary">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
              <IconButton onClick={handleOpenUserMenu}>
                <Avatar alt={state.viewer.name} src={state.viewer.imageUrl} sx={{ width: 24, height: 24 }} />
              </IconButton>
              <UserMenu
                name={state.viewer.name}
                username={state.viewer.username}
                open={Boolean(state.anchorElement)}
                anchorEl={state.anchorElement}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClose={handleCloseUserMenu}
                keepMounted
              />
            </Box>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};
