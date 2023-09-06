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
import { test as base } from '@playwright/test';
import { Fixture } from './fixture.types';
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

export const test = base.extend<Fixture>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page, ''));
  },

  invitationsPage: async ({ page }, use) => {
    await use(new InvitationsPage(page));
  },

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },

  newOrganizationPage: async ({ page }, use) => {
    await use(new NewOrganizationPage(page));
  },

  organizationPage: async ({ page }, use) => {
    await use(new OrganizationPage(page, ''));
  },

  organizationMembersPage: async ({ page }, use) => {
    await use(new OrganizationMembersPage(page, ''));
  },

  organizationSettingsPage: async ({ page }, use) => {
    await use(new OrganizationSettingsPage(page, ''));
  },

  adminAccountsPage: async ({ page }, use) => {
    await use(new AdminAccountsPage(page));
  },

  adminNewAccountPage: async ({ page }, use) => {
    await use(new AdminNewAccountPage(page));
  },

  userMenu: async ({ page }, use) => {
    await use(new UserMenu(page));
  },
});
