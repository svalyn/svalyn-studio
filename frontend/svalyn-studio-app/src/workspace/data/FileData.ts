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

import { ApolloClient, gql } from '@apollo/client';
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

export class FileData implements IResourceData {
  __typename: string = 'FileData';

  constructor(public path: string, public name: string, public container: IContainerData | null) {}
}

const getChangeResourceQuery = gql`
  query getChangeResourceQuery($changeId: ID!, $path: String!, $name: String!) {
    viewer {
      change(id: $changeId) {
        resource(path: $path, name: $name) {
          contentType
          content
        }
      }
    }
  }
`;

export class FileDataItemProvider
  implements IItemIdentityProvider, IItemLabelProvider, ITreeItemContentProvider, IItemViewProvider
{
  constructor(private changeId: string, private apolloClient: ApolloClient<object>) {}

  public getId(object: FileData): string {
    return object.name;
  }

  public getText(object: FileData): string {
    return object.name;
  }

  public getImage(object: FileData): ReactNode {
    return null;
  }

  public hasChildren(object: FileData): boolean {
    return false;
  }

  public getChildren(object: FileData): IAdaptable[] {
    return [];
  }

  public getElements(object: FileData): IAdaptable[] {
    return this.getChildren(object);
  }

  public getParent(object: FileData): IAdaptable | null {
    return object.container;
  }

  public isViewable(object: FileData): boolean {
    return true;
  }

  public getContent(object: FileData): Promise<ViewContent> {
    const variables: GetChangeResourceVariables = { changeId: this.changeId, path: object.path, name: object.name };
    return this.apolloClient
      .query<GetChangeResourceData, GetChangeResourceVariables>({ query: getChangeResourceQuery, variables })
      .then((result) => {
        if (result.data.viewer.change?.resource) {
          const { content, contentType } = result.data.viewer.change.resource;
          return {
            content,
            contentType,
          };
        }
        return {
          content: 'File not found',
          contentType: 'TEXT_PLAIN',
        };
      });
  }
}

export interface GetChangeResourceVariables {
  changeId: string;
  path: string;
  name: string;
}

export interface GetChangeResourceData {
  viewer: Viewer;
}

export interface Viewer {
  change: Change | null;
}

export interface Change {
  resource: ChangeResource | null;
}

export interface ChangeResource {
  contentType: ContentType;
  content: string;
}

type ContentType = 'TEXT_PLAIN' | 'UNKNOWN';
