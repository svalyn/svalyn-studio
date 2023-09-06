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

import { Page, expect } from '@playwright/test';

export class OrganizationSettingsPage {
  constructor(public readonly page: Page, public identifier: string) {}

  async goto(identifier: string) {
    this.identifier = identifier;
    await this.page.goto(`http://localhost:5173/orgs/${this.identifier}/settings`);
  }

  async rename(newName: string) {
    await this.page.getByRole('textbox', { name: 'Organization Name' }).fill(newName);
    await this.page.getByRole('button', { name: 'RENAME' }).click();

    await expect(this.page.getByRole('heading', { name: newName })).toBeVisible();
  }

  async delete() {
    await this.page.getByRole('button', { name: 'DELETE ORGANIZATION' }).click();
    await this.page.getByRole('button', { name: 'DELETE' }).click();

    await expect(this.page).toHaveURL('http://localhost:5173');
  }
}
