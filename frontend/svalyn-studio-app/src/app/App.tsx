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

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorView } from '../views/error/ErrorView';
import { HelpView } from '../views/help/HelpView';
import { HomeView } from '../views/home/HomeView';
import { InvitationsView } from '../views/invitations/InvitationsView';
import { LoginView } from '../views/login/LoginView';
import { NewOrganizationView } from '../views/new-organization/NewOrganizationView';
import { NotFoundView } from '../views/notfound/NotFoundView';
import { OAuth2RedirectView } from '../views/oauth2redirect/OAuth2RedirectView';
import { OrganizationView } from '../views/organization/OrganizationView';
import { ProfileView } from '../views/profile/ProfileView';
import { AuthenticationRedirectionBoundary } from './AuthenticationRedirectionBoundary';
import { theme } from './theme';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthenticationRedirectionBoundary>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/orgs/:organizationIdentifier" element={<OrganizationView />} />
            <Route path="/orgs/:organizationIdentifier/members" element={<OrganizationView />} />
            <Route path="/orgs/:organizationIdentifier/settings" element={<OrganizationView />} />
            <Route path="/new/organization" element={<NewOrganizationView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/invitations" element={<InvitationsView />} />
            <Route path="/error" element={<ErrorView />} />
            <Route path="help" element={<HelpView />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </AuthenticationRedirectionBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};
