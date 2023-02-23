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

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import TreeItem from '@mui/lab/TreeItem';
import Box from '@mui/material/Box';
import { Folder, Resource, ResourceTreeItemData, ResourceTreeItemProps } from './ResourceTreeItem.types';

const isFolder = (treeItemData: ResourceTreeItemData): treeItemData is Folder =>
  treeItemData.hasOwnProperty('children');
const isResource = (treeItemData: ResourceTreeItemData): treeItemData is Resource =>
  treeItemData.hasOwnProperty('path');

export const ResourceTreeItem = ({ treeItemData: treeItem, onResourceClick }: ResourceTreeItemProps) => {
  return (
    <TreeItem
      nodeId={treeItem.name}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: (theme) => theme.spacing(0.5), whiteSpace: 'nowrap' }}>
          {isResource(treeItem) ? <InsertDriveFileOutlinedIcon fontSize="small" /> : null}
          {treeItem.name}
        </Box>
      }
      key={treeItem.name}
      onClick={() => {
        if (isResource(treeItem)) {
          onResourceClick(treeItem);
        }
      }}
    >
      {isFolder(treeItem)
        ? treeItem.children.map((child) => (
            <ResourceTreeItem key={child.name} treeItemData={child} onResourceClick={onResourceClick} />
          ))
        : null}
    </TreeItem>
  );
};
