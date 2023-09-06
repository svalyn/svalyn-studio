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

import { expect } from '@playwright/test';
import { test } from '../../fixture';
import { Organization } from '../../fixture.types';

test.describe('Update organization members', () => {
  let organization: Organization;

  test.beforeEach(async ({ loginPage, newOrganizationPage }) => {
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    await newOrganizationPage.goto();
    organization = await newOrganizationPage.createOrganization();
  });

  test.afterEach(async ({ organizationSettingsPage }) => {
    await organizationSettingsPage.goto(organization.identifier);
    await organizationSettingsPage.delete();
  });

  test('should have the creator of the project has a member', async ({ organizationMembersPage, page }) => {
    await organizationMembersPage.goto(organization.identifier);
    await expect(page.getByRole('cell', { name: 'Admin Admin' })).toBeVisible();
  });
});
