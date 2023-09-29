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

import { IAdaptable } from './AdapterFactory.types';
import { StyledString } from './StyledString';

export interface IItemIdentityProvider {
  getId(object: unknown): string;
}

export interface IStructuredItemContentProvider {
  getElements(object: unknown): IAdaptable[];
}

export interface ITreeItemContentProvider extends IStructuredItemContentProvider {
  hasChildren(object: unknown): boolean;
  getChildren(object: unknown): IAdaptable[];
  getParent(object: unknown): IAdaptable | null;
}

export interface IItemLabelProvider {
  getText(object: unknown): string;
  getImage(object: unknown): React.ReactNode;
}

export interface IItemStyledLabelProvider {
  getStyledText(object: unknown): StyledString;
}

export interface IItemViewProvider {
  isViewable(object: unknown): boolean;
  getContent(object: unknown): Promise<ViewContent>;
}

export interface ViewContent {
  content: string;
  contentType: string;
}
