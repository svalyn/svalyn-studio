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

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NewOrganizationPage } from './pages/NewOrganizationPage';
import { AdminAccountsPage } from './pages/admin/AdminAccountsPage';
import { AdminNewAccountPage } from './pages/admin/AdminNewAccountPage';
import { OrganizationMembersPage } from './pages/organization/OrganizationMembersPage';
import { OrganizationPage } from './pages/organization/OrganizationPage';
import { OrganizationSettingsPage } from './pages/organization/OrganizationSettingsPage';
import { InvitationsPage } from './pages/profile/InvitationsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/profile/SettingsPage';
import { UserMenu } from './widgets/UserMenu';

export type Fixture = {
  loginPage: LoginPage;
  homePage: HomePage;
  profilePage: ProfilePage;
  invitationsPage: InvitationsPage;
  settingsPage: SettingsPage;
  newOrganizationPage: NewOrganizationPage;
  organizationPage: OrganizationPage;
  organizationMembersPage: OrganizationMembersPage;
  organizationSettingsPage: OrganizationSettingsPage;
  adminAccountsPage: AdminAccountsPage;
  adminNewAccountPage: AdminNewAccountPage;

  userMenu: UserMenu;
};

export type Organization = {
  name: string;
  identifier: string;
};

export type Project = {
  name: string;
  identifier: string;
};
