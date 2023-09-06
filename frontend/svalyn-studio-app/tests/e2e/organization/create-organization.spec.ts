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

test.describe('Create organization', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAsAdmin();
  });

  test('should let me create and delete an organization', async ({
    page,
    newOrganizationPage,
    organizationSettingsPage,
  }) => {
    await newOrganizationPage.goto();
    const organization = await newOrganizationPage.createOrganization();

    await expect(page).toHaveURL(`http://localhost:5173/orgs/${organization.identifier}`);
    await expect(page.getByRole('heading', { name: organization.name })).toBeVisible();

    await organizationSettingsPage.goto(organization.identifier);
    await organizationSettingsPage.delete();

    await page.goto(`http://localhost:5173/orgs/${organization.identifier}`);
    await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
  });
});
