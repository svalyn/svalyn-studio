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
import {
  Folder,
  Resource,
  ResourceTreeData,
  ResourceTreeItemData,
  ResourceTreeItemDataContainer,
  ResourceTreeProps,
} from './ResourceTree.types';
import { ResourceTreeItem } from './ResourceTreeItem';

const isResourceTreeItemDataContainer = (treeItemData: ResourceTreeItemData): treeItemData is Folder =>
  treeItemData.hasOwnProperty('children');

const getChildResourceTreeItemDataContainer = (
  container: ResourceTreeItemDataContainer,
  segment: string
): ResourceTreeItemDataContainer | null => {
  const resourceTreeItemData = container.children.filter((child) => child.name === segment).at(0);
  if (resourceTreeItemData && isResourceTreeItemDataContainer(resourceTreeItemData)) {
    return resourceTreeItemData;
  }
  return null;
};

const computeTree = (resources: Resource[]): ResourceTreeData => {
  const tree: ResourceTreeData = { children: [] };

  for (const resource of resources) {
    let currentResourceTreeItemContainer: ResourceTreeItemDataContainer = tree;

    const segments = resource.path.split('/');
    for (const segment of segments) {
      let existingResourceTreeItem = getChildResourceTreeItemDataContainer(currentResourceTreeItemContainer, segment);
      if (!existingResourceTreeItem) {
        const newResourceTreeItem: Folder = { name: segment, children: [] };
        currentResourceTreeItemContainer.children.push(newResourceTreeItem);
        existingResourceTreeItem = newResourceTreeItem;
      }
      currentResourceTreeItemContainer = existingResourceTreeItem;
    }

    const leafResourceTreeItem: Resource = { id: resource.id, path: resource.path, name: resource.name };
    currentResourceTreeItemContainer.children.push(leafResourceTreeItem);
  }

  return tree;
};

export const ResourceTree = ({ resources, onResourceClick }: ResourceTreeProps) => {
  const data = computeTree(resources);
  return (
    <TreeView
      sx={{ overflowY: 'auto' }}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {data.children.map((child) => (
        <ResourceTreeItem key={child.name} treeItemData={child} onResourceClick={onResourceClick} />
      ))}
    </TreeView>
  );
};
