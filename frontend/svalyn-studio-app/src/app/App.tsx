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
import { ChangeProposalView } from '../views/changeproposal/ChangeProposalView';
import { DomainView } from '../views/domain/DomainView';
import { DomainsView } from '../views/domains/DomainsView';
import { ErrorView } from '../views/error/ErrorView';
import { HelpView } from '../views/help/HelpView';
import { HomeView } from '../views/home/HomeView';
import { InvitationsView } from '../views/invitations/InvitationsView';
import { LoginView } from '../views/login/LoginView';
import { NewChangeProposalView } from '../views/new-changeproposal/NewChangeProposalView';
import { NewOrganizationView } from '../views/new-organization/NewOrganizationView';
import { NotFoundView } from '../views/notfound/NotFoundView';
import { NotificationsView } from '../views/notifications/NotificationsView';
import { OAuth2RedirectView } from '../views/oauth2redirect/OAuth2RedirectView';
import { OrganizationView } from '../views/organization/OrganizationView';
import { ProfileView } from '../views/profile/ProfileView';
import { ProjectView } from '../views/project/ProjectView';
import { ResourceView } from '../views/resource/ResourceView';
import { SearchView } from '../views/search/SearchView';
import { SettingsView } from '../views/settings/SettingsView';
import { WorkspaceView } from '../views/workspace/WorkspaceView';
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
            <Route path="/new/organization" element={<NewOrganizationView />} />
            <Route path="/orgs/:organizationIdentifier" element={<OrganizationView />} />
            <Route path="/orgs/:organizationIdentifier/tags" element={<OrganizationView />} />
            <Route path="/orgs/:organizationIdentifier/members" element={<OrganizationView />} />
            <Route path="/orgs/:organizationIdentifier/settings" element={<OrganizationView />} />
            <Route path="/projects/:projectIdentifier" element={<ProjectView />} />
            <Route path="/projects/:projectIdentifier/activity" element={<ProjectView />} />
            <Route path="/projects/:projectIdentifier/changeproposals" element={<ProjectView />} />
            <Route path="/projects/:projectIdentifier/tags" element={<ProjectView />} />
            <Route path="/projects/:projectIdentifier/settings" element={<ProjectView />} />
            <Route path="/projects/:projectIdentifier/new/changeproposal" element={<NewChangeProposalView />} />
            <Route path="/projects/:projectIdentifier/changes/:changeId/resources/*" element={<ResourceView />} />
            <Route path="/projects/:projectIdentifier/changes/:changeId" element={<WorkspaceView />} />
            <Route path="/changeproposals/:changeProposalId" element={<ChangeProposalView />} />
            <Route path="/changeproposals/:changeProposalId/files" element={<ChangeProposalView />} />
            <Route path="/domains" element={<DomainsView />} />
            <Route path="/domains/:domainIdentifier" element={<DomainView />} />
            <Route path="/search" element={<SearchView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/settings/authentication-tokens" element={<SettingsView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectView />} />
            <Route path="/profile/:username" element={<ProfileView />} />
            <Route path="/invitations" element={<InvitationsView />} />
            <Route path="/notifications" element={<NotificationsView />} />
            <Route path="/error" element={<ErrorView />} />
            <Route path="help" element={<HelpView />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </AuthenticationRedirectionBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};
