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

import { Route, Routes } from 'react-router-dom';
import { ChangeProposalsRouter } from '../changeproposals/ChangeProposalsRouter';
import { DomainsRouter } from '../domains/DomainsRouter';
import { ErrorsRouter } from '../errors/ErrorsRouter';
import { HelpRouter } from '../help/HelpRouter';
import { HomeView } from '../home/HomeView';
import { InvitationsRouter } from '../invitations/InvitationsRouter';
import { LoginRouter } from '../login/LoginRouter';
import { NewRouter } from '../new/NewRouter';
import { NotFoundView } from '../notfound/NotFoundView';
import { NotificationsRouter } from '../notifications/NotificationsRouter';
import { OAuth2Router } from '../oauth2/OAuth2Router';
import { OrganizationRouter } from '../organizations/OrganizationRouter';
import { PaletteProvider } from '../palette/PaletteProvider';
import { ProfilesRouter } from '../profiles/ProfilesRouter';
import { ProjectRouter } from '../projects/ProjectRouter';
import { SearchRouter } from '../search/SearchRouter';
import { SettingsRouter } from '../settings/SettingsRouter';
import { WorkspaceView } from '../workspace/WorkspaceView';

export const App = () => {
  return (
    <PaletteProvider>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/new/*" element={<NewRouter />} />
        <Route path="/orgs/:organizationIdentifier/*" element={<OrganizationRouter />} />
        <Route path="/projects/:projectIdentifier/*" element={<ProjectRouter />} />
        <Route path="/projects/:projectIdentifier/changes/:changeId" element={<WorkspaceView />} />
        <Route path="/changeproposals/*" element={<ChangeProposalsRouter />} />
        <Route path="/domains/*" element={<DomainsRouter />} />
        <Route path="/search/*" element={<SearchRouter />} />
        <Route path="/profiles/*" element={<ProfilesRouter />} />
        <Route path="/notifications/*" element={<NotificationsRouter />} />
        <Route path="/invitations/*" element={<InvitationsRouter />} />
        <Route path="/settings/*" element={<SettingsRouter />} />
        <Route path="/help/*" element={<HelpRouter />} />
        <Route path="/errors/*" element={<ErrorsRouter />} />
        <Route path="/login/*" element={<LoginRouter />} />
        <Route path="/oauth2/*" element={<OAuth2Router />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </PaletteProvider>
  );
};
