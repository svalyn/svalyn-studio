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

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import { IAdaptable } from '../api/providers/AdapterFactory.types';
import {
  IItemIdentityProvider,
  IItemLabelProvider,
  ITreeItemContentProvider,
} from '../api/providers/ItemProviders.types';
import { useAdapterFactory } from '../api/providers/useAdapterFactory';
import { Tab } from './Tab';
import { TabBarBreadcrumbsProps, TabBarProps } from './TabBar.types';

export const TabBar = ({ objects, currentObject, onOpen, onClose }: TabBarProps) => {
  const { adapterFactory } = useAdapterFactory();

  const identityProvider = adapterFactory.adapt<IItemIdentityProvider>(currentObject, 'IItemIdentityProvider');
  const currentObjectId = identityProvider?.getId(currentObject) ?? '';

  return (
    <Box>
      <Box
        data-testid="tab-area"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflow: 'auto',
          flex: 'none',
          backgroundColor: (theme) => theme.palette.background.default,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          minHeight: '35px',
        }}
      >
        {objects.map((object) => {
          const identityProvider = adapterFactory.adapt<IItemIdentityProvider>(object, 'IItemIdentityProvider');
          const id = identityProvider?.getId(object) ?? '';

          return <Tab key={id} object={object} currentObjectId={currentObjectId} onOpen={onOpen} onClose={onClose} />;
        })}
      </Box>
      <TabBarBreadcrumbs object={currentObject} />
      <Box sx={{ height: '3px', boxShadow: 'rgba(106, 115, 125, 0.1) 0px 6px 6px -6px inset' }} />
    </Box>
  );
};

const TabBarBreadcrumbs = ({ object }: TabBarBreadcrumbsProps) => {
  const { adapterFactory } = useAdapterFactory();

  let segments: string[] = [];

  let currentObject: IAdaptable | null = object;
  while (currentObject) {
    const labelProvider = adapterFactory.adapt<IItemLabelProvider>(currentObject, 'IItemLabelProvider');
    if (labelProvider) {
      segments = [labelProvider.getText(currentObject)].concat(segments);
    }

    const treeItemContentProvider: ITreeItemContentProvider | null = adapterFactory.adapt<ITreeItemContentProvider>(
      currentObject,
      'ITreeItemContentProvider'
    );
    if (treeItemContentProvider) {
      currentObject = treeItemContentProvider.getParent(currentObject);
    }
  }

  return (
    <Breadcrumbs
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        px: (theme) => theme.spacing(2),
        minHeight: '22px',
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
      separator="/"
      aria-label="breadcrumb"
      data-testid="tab-breadcrumb"
    >
      {segments.map((segment, index) => (
        <Typography key={index} variant="tbody" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {segment}
        </Typography>
      ))}
    </Breadcrumbs>
  );
};
