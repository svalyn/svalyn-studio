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
import { Project } from '../../fixture.types';

export class OrganizationPage {
  constructor(public readonly page: Page, public identifier: string) {}

  async goto(identifier: string) {
    this.identifier = identifier;
    await this.page.goto(`http://localhost:5173/orgs/${this.identifier}`);
  }

  async createProject(): Promise<Project> {
    const identifier = await this.page.evaluate(() => crypto.randomUUID());
    const name = `Project ${identifier}`;

    await this.page.getByRole('button', { name: 'NEW PROJECT' }).click();
    await this.page.getByRole('textbox', { name: 'Project Name' }).fill(name);
    await this.page.getByRole('textbox', { name: 'Project Identifier' }).fill(identifier);
    await this.page
      .getByRole('textbox', { name: 'Project Description' })
      .fill(`The description of the project "${name}"`);
    await this.page.getByRole('button', { name: 'CREATE' }).click();

    await expect(this.page).toHaveURL(`http://localhost:5173/projects/${identifier}`);

    return new Promise((resolve) => {
      resolve({ identifier, name });
    });
  }
}
