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

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PaletteProvider } from '../palette/PaletteProvider';
import { ChangeProposalRouter } from '../views/changeproposal/ChangeProposalRouter';
import { DomainRouter } from '../views/domains/DomainRouter';
import { ErrorRouter } from '../views/error/ErrorRouter';
import { HelpRouter } from '../views/help/HelpRouter';
import { HomeView } from '../views/home/HomeView';
import { InvitationRouter } from '../views/invitations/InvitationRouter';
import { LoginRouter } from '../views/login/LoginRouter';
import { NewRouter } from '../views/new-organization/NewRouter';
import { NotFoundView } from '../views/notfound/NotFoundView';
import { NotificationRouter } from '../views/notifications/NotificationRouter';
import { OAuth2Router } from '../views/oauth2redirect/OAuth2Router';
import { OrganizationRouter } from '../views/organization/OrganizationRouter';
import { ProfileRouter } from '../views/profile/ProfileRouter';
import { ProjectRouter } from '../views/project/ProjectRouter';
import { SearchRouter } from '../views/search/SearchRouter';
import { SettingsRouter } from '../views/settings/SettingsRouter';
import { AuthenticationRedirectionBoundary } from './AuthenticationRedirectionBoundary';
import { theme } from './theme';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthenticationRedirectionBoundary>
          <PaletteProvider>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/new/*" element={<NewRouter />} />
              <Route path="/orgs/*" element={<OrganizationRouter />} />
              <Route path="/projects/*" element={<ProjectRouter />} />
              <Route path="/changeproposals/*" element={<ChangeProposalRouter />} />
              <Route path="/domains/*" element={<DomainRouter />} />
              <Route path="/search/*" element={<SearchRouter />} />
              <Route path="/profiles/*" element={<ProfileRouter />} />
              <Route path="/notifications/*" element={<NotificationRouter />} />
              <Route path="/invitations/*" element={<InvitationRouter />} />
              <Route path="/settings/*" element={<SettingsRouter />} />
              <Route path="/help/*" element={<HelpRouter />} />
              <Route path="/error/*" element={<ErrorRouter />} />
              <Route path="/login/*" element={<LoginRouter />} />
              <Route path="/oauth2/*" element={<OAuth2Router />} />
              <Route path="*" element={<NotFoundView />} />
            </Routes>
          </PaletteProvider>
        </AuthenticationRedirectionBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};
