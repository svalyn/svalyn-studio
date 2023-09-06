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

import { Page } from '@playwright/test';

export class UserMenu {
  constructor(public readonly page: Page) {}

  async open() {
    await this.page.getByTestId('user-menu-avatar').click();
  }

  async gotoDashboard() {
    await this.page.getByRole('menuitem', { name: 'Dashboard' }).click();
  }

  async gotoProfile() {
    await this.page.getByRole('menuitem', { name: 'Profile' }).click();
  }

  async gotoInvitations() {
    await this.page.getByRole('menuitem', { name: 'Invitations' }).click();
  }

  async gotoSettings() {
    await this.page.getByRole('menuitem', { name: 'Settings' }).click();
  }

  async gotoAdmin() {
    await this.page.getByRole('menuitem', { name: 'Admin Panel' }).click();
  }

  async gotoHelp() {
    await this.page.getByRole('menuitem', { name: 'Help' }).click();
  }

  async logout() {
    await this.page.getByRole('menuitem', { name: 'Sign out' }).click();
  }

  async close() {
    await this.page.press('[data-testid="user-menu-avatar"]', 'Esc');
  }
}
