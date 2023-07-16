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
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import { useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { Navbar } from '../navbars/Navbar';
import { SettingsViewPanel, SettingsViewState } from './SettingsView.types';
import { SettingsViewDrawer } from './SettingsViewDrawer';
import { AuthenticationTokensSettingsTab } from './authentication-tokens/AuthenticationTokensSettingsTab';

export const SettingsView = () => {
  const location = useLocation();

  const authenticationTokensMatch = matchPath('/settings/authentication-tokens', location.pathname);

  let panel: SettingsViewPanel = 'AuthenticationTokens';
  if (authenticationTokensMatch) {
    panel = 'AuthenticationTokens';
  }

  const [state, setState] = useState<SettingsViewState>({
    panel,
  });

  useEffect(() => {
    setState((prevState) => ({ ...prevState, panel }));
  }, [location]);

  let panelElement = null;
  if ((state.panel = 'AuthenticationTokens')) {
    panelElement = <AuthenticationTokensSettingsTab />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <Container maxWidth="lg">
        <Toolbar />
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: '1fr',
            gridTemplateColumns: 'min-content 1fr',
            gap: (theme) => theme.spacing(2),
          }}
        >
          <SettingsViewDrawer panel={state.panel} />
          {panelElement}
        </Box>
      </Container>
    </Box>
  );
};
