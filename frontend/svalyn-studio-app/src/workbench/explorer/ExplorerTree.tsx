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

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TreeView from '@mui/lab/TreeView';
import { IAdaptable } from '../api/providers/AdapterFactory.types';
import { IItemLabelProvider, ITreeItemContentProvider } from '../api/providers/ItemProviders.types';
import { useAdapterFactory } from '../api/providers/useAdapterFactory';
import { ExplorerTreeProps } from './ExplorerTree.types';
import { ExplorerTreeItem } from './ExplorerTreeItem';

export const ExplorerTree = ({ object, onClick }: ExplorerTreeProps) => {
  const { adapterFactory } = useAdapterFactory();

  const treeItemContentProvider = adapterFactory.adapt<ITreeItemContentProvider>(object, 'ITreeItemContentProvider');
  const elements = treeItemContentProvider?.getElements(object) ?? [];

  return (
    <TreeView
      sx={{ overflowY: 'auto' }}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {elements.map((child, index) => {
        const object = child as IAdaptable;
        const childLabelProvider = adapterFactory.adapt<IItemLabelProvider>(object, 'IItemLabelProvider');
        const key = childLabelProvider?.getText(object) ?? index;
        return <ExplorerTreeItem key={key} object={object} onClick={onClick} />;
      })}
    </TreeView>
  );
};
