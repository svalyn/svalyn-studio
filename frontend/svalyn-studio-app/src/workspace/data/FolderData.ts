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
import { IAdaptable } from '../../workbench/api/providers/AdapterFactory.types';
import {
  IItemIdentityProvider,
  IItemLabelProvider,
  IItemViewProvider,
  ITreeItemContentProvider,
  ViewContent,
} from '../../workbench/api/providers/ItemProviders.types';
import { IContainerData, IResourceData } from './ResourceData';

export class FolderData implements IContainerData {
  __typename: string = 'FolderData';

  constructor(public name: string, public resources: IResourceData[], public container: IContainerData | null) {}
}

export class FolderDataItemProvider
  implements IItemIdentityProvider, IItemLabelProvider, ITreeItemContentProvider, IItemViewProvider
{
  public getId(object: FolderData): string {
    return object.name;
  }

  public getText(object: FolderData): string {
    return object.name;
  }

  public getImage(object: FolderData): ReactNode {
    return null;
  }

  public hasChildren(object: FolderData): boolean {
    return object.resources.length > 0;
  }

  public getChildren(object: FolderData): IAdaptable[] {
    return object.resources;
  }

  public getElements(object: FolderData): IAdaptable[] {
    return this.getChildren(object);
  }

  public getParent(object: FolderData): IAdaptable | null {
    return object.container;
  }

  public isViewable(object: FolderData): boolean {
    return false;
  }

  public getContent(object: FolderData): Promise<ViewContent> {
    return Promise.reject(new Error('Unsupported operation'));
  }
}
