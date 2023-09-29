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

import { ReactNode } from 'react';
import { IEditingContext } from '../../workbench/api/editingcontext/EditingContext.types';
import { IAdaptable } from '../../workbench/api/providers/AdapterFactory.types';
import {
  IItemIdentityProvider,
  IItemLabelProvider,
  IItemViewProvider,
  ITreeItemContentProvider,
  ViewContent,
} from '../../workbench/api/providers/ItemProviders.types';
import { ChangeData } from './ChangeData';

export class SingleChangeEditingContextData implements IEditingContext {
  __typename: string = 'SingleChangeEditingContextData';

  constructor(public change: ChangeData) {}
}

export class SingleChangeEditingContextDataItemProvider
  implements IItemIdentityProvider, IItemLabelProvider, ITreeItemContentProvider, IItemViewProvider
{
  public getId(object: SingleChangeEditingContextData): string {
    return `SingleChangeEditingContext[changeId=${object.change.id}]`;
  }

  public getText(object: SingleChangeEditingContextData): string {
    return '';
  }

  public getImage(object: SingleChangeEditingContextData): ReactNode {
    return null;
  }

  public hasChildren(object: SingleChangeEditingContextData): boolean {
    return true;
  }

  public getChildren(object: SingleChangeEditingContextData): IAdaptable[] {
    return [object.change];
  }

  public getElements(object: SingleChangeEditingContextData): IAdaptable[] {
    return this.getChildren(object);
  }

  public getParent(object: SingleChangeEditingContextData): IAdaptable | null {
    return null;
  }

  public isViewable(object: SingleChangeEditingContextData): boolean {
    return false;
  }

  public getContent(object: SingleChangeEditingContextData): Promise<ViewContent> {
    return Promise.reject(new Error('Unsupported operation'));
  }
}
