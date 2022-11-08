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

import { expect, test } from '@playwright/test';

test.describe('New project view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page
      .getByRole('tab')
      .filter({ has: page.getByTestId('EmailIcon') })
      .click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page).not.toHaveURL('http://localhost:5173/login');
  });

  test.beforeEach(async ({ page, browserName }) => {
    await page.goto('http://localhost:5173/new/organization');

    await page.getByRole('textbox', { name: 'Organization Name' }).fill(`New project view ${browserName}`);
    await page.getByRole('textbox', { name: 'Organization Identifier' }).fill(`new-project-view-${browserName}`);
    await page.getByRole('button', { name: 'CREATE' }).click();

    await expect(page).toHaveURL(`http://localhost:5173/orgs/new-project-view-${browserName}`);
  });

  test.afterEach(async ({ page, browserName }) => {
    await page.goto(`http://localhost:5173/orgs/new-project-view-${browserName}/settings`);
    await page.getByRole('button', { name: 'DELETE ORGANIZATION' }).click();
    await page.getByRole('button', { name: 'DELETE' }).click();

    await page.goto(`http://localhost:5173/orgs/new-project-view-${browserName}`);
    expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
  });

  test('should let me create a project', async ({ page, browserName }) => {
    await page.goto(`http://localhost:5173/orgs/new-project-view-${browserName}`);

    await expect(page.getByRole('heading', { name: `New project view ${browserName}` })).toBeVisible();

    await page.getByRole('button', { name: 'NEW PROJECT' }).click();
    await page.getByRole('textbox', { name: 'Project Name' }).fill(`New project view ${browserName}`);
    await page.getByRole('textbox', { name: 'Project Identifier' }).fill(`new-project-view-${browserName}`);
    await page
      .getByRole('textbox', { name: 'Project Description' })
      .fill(`New project view description ${browserName}`);
    await page.getByRole('button', { name: 'CREATE' }).click();

    await expect(page).toHaveURL(`http://localhost:5173/projects/new-project-view-${browserName}`);
  });
});
