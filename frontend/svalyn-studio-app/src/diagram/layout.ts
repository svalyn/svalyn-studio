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

import dagre from 'dagre';
import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { Position } from 'reactflow';
import { Diagram } from './DiagramEditor.types';
import { RawListNode } from './nodes/ListNode';
import { ListNodeData } from './nodes/ListNode.types';

export const beforeLayout = (diagram: Diagram): Root => {
  const hiddenContainer = document.createElement('div');
  hiddenContainer.id = 'hidden-container';
  hiddenContainer.style.display = 'inline-block';
  hiddenContainer.style.position = 'absolute';
  hiddenContainer.style.visibility = 'hidden';
  hiddenContainer.style.zIndex = '-1';
  document.body.appendChild(hiddenContainer);
  const root = createRoot(hiddenContainer);

  const elements: JSX.Element[] = [];
  diagram.nodes.forEach((node, index) => {
    if (hiddenContainer && node.type === 'listNode') {
      const data = node.data as ListNodeData;
      const children: JSX.Element[] = [React.createElement(RawListNode, { data })];
      const element: JSX.Element = React.createElement('div', {
        id: `${node.id}-${index}`,
        key: node.id,
        children,
      });
      elements.push(element);
    }
  });
  root.render(React.createElement(React.Fragment, { children: elements }));

  return root;
};

const nodeWidth = 170;
const nodeHeight = 50;

export const performLayout = (diagram: Diagram): Diagram => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' });

  diagram.nodes.forEach((node, index) => {
    var hiddenContainer = document.getElementById(`${node.id}-${index}`);
    if (hiddenContainer && node.type === 'listNode') {
      dagreGraph.setNode(node.id, { width: hiddenContainer.clientWidth, height: hiddenContainer.clientHeight });
    } else {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    }
  });

  diagram.edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  diagram.nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return diagram;
};

export const afterLayout = (root: Root) => {
  setTimeout(() => root.unmount());
  var hiddenContainer = document.getElementById('hidden-container');
  if (hiddenContainer?.parentNode) {
    hiddenContainer.parentNode.removeChild(hiddenContainer);
  }
};
