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

test.describe('Login view', () => {
  test('should let me log in with Github', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    const loginWithGithubButton = page.getByRole('link', { name: 'LOGIN WITH GITHUB' });
    await expect(loginWithGithubButton).toHaveAttribute(
      'href',
      'http://localhost:8080/oauth2/authorization/github?redirect_uri=http://localhost:5173/oauth2/redirect'
    );
  });

  test('should let me log in with my credentials', async ({ page }) => {
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

  test('should let me log in and then log out', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page
      .getByRole('tab')
      .filter({ has: page.getByTestId('EmailIcon') })
      .click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await page
      .getByRole('button')
      .filter({ has: page.getByTestId('PersonIcon') })
      .click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

  test('should redirect unauthenticated users to the login page', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page).toHaveURL('http://localhost:5173/login');
  });
});
