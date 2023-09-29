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

import { gql, useApolloClient, useQuery } from '@apollo/client';
import Box from '@mui/material/Box';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Workbench } from '../workbench/Workbench';
import { IEditingContext } from '../workbench/api/editingcontext/EditingContext.types';
import { EditingContextProvider } from '../workbench/api/editingcontext/EditingContextProvider';
import { IAdaptable, IAdapterFactory } from '../workbench/api/providers/AdapterFactory.types';
import { AdapterFactoryProvider } from '../workbench/api/providers/AdapterFactoryProvider';
import { Change, GetChangeResourcesData, GetChangeResourcesVariables } from './WorkspaceView.types';
import { ChangeData, ChangeDataItemProvider } from './data/ChangeData';
import { FileData, FileDataItemProvider } from './data/FileData';
import { FolderDataItemProvider } from './data/FolderData';
import { IResourceData } from './data/ResourceData';
import {
  SingleChangeEditingContextData,
  SingleChangeEditingContextDataItemProvider,
} from './data/SingleChangeEditingContextData';

const getChangeResourcesQuery = gql`
  query getChangeResourcesQuery($changeId: ID!) {
    viewer {
      change(id: $changeId) {
        id
        resources {
          edges {
            node {
              id
              path
              name
            }
          }
        }
      }
    }
  }
`;

export const WorkspaceView = () => {
  const { changeId } = useParams();

  const variables: GetChangeResourcesVariables = { changeId: changeId ?? '' };
  const { data, error } = useQuery<GetChangeResourcesData, GetChangeResourcesVariables>(getChangeResourcesQuery, {
    variables,
  });

  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  const apolloClient = useApolloClient();

  const adapterFactory: IAdapterFactory = {
    adapt: function <T>(object: IAdaptable, type: unknown): T | null {
      if (object.__typename === 'SingleChangeEditingContextData') {
        return new SingleChangeEditingContextDataItemProvider() as T;
      } else if (object.__typename === 'ChangeData') {
        return new ChangeDataItemProvider() as T;
      } else if (object.__typename === 'FolderData') {
        return new FolderDataItemProvider() as T;
      } else if (object.__typename === 'FileData') {
        return new FileDataItemProvider(changeId ?? '', apolloClient) as T;
      }
      return null;
    },
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: 'minmax(0, 1fr)',
        gridTemplateColumns: 'minmax(0, 1fr)',
        width: '100vw',
        height: '100vh',
      }}
    >
      {changeId && data && data.viewer.change ? (
        <EditingContextProvider value={{ editingContext: convertData(data.viewer.change) }}>
          <AdapterFactoryProvider value={{ adapterFactory }}>
            <Workbench />
          </AdapterFactoryProvider>
        </EditingContextProvider>
      ) : null}
    </Box>
  );
};

const convertData = (change: Change): IEditingContext => {
  const resources: IResourceData[] = [];

  change.resources.edges
    .map((edge) => edge.node)
    .forEach((resource) => {
      const resourceData = new FileData(resource.path, resource.name, null);
      resources.push(resourceData);
    });

  const changeData: ChangeData = new ChangeData(change.id, resources, null);

  const editingContext: IEditingContext = new SingleChangeEditingContextData(changeData);
  return editingContext;
};
