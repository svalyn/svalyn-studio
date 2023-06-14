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

import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { Edge, Node } from 'reactflow';

const elk = new ELK();

export const performLayout = (
  nodes: Node[],
  edges: Edge[],
  layoutOptions: LayoutOptions
): Promise<{ nodes: Node[] }> => {
  const graph: ElkNode = {
    id: 'root',
    layoutOptions,
    children: [],
    edges: [],
  };

  const nodeId2Node = new Map<string, Node>();
  nodes.forEach((node) => nodeId2Node.set(node.id, node));

  nodes.forEach((node) => {
    if (graph.children) {
      const elkNode: ElkNode = {
        id: node.id,
      };

      if (node.type === 'listNode') {
        const element = document.querySelector(`[data-id="${node.id}"]`);
        if (element) {
          elkNode.width = element.clientWidth;
          elkNode.height = element.clientHeight;
        }
      } else {
        elkNode.width = 170;
        elkNode.height = 50;
      }

      graph.children.push(elkNode);
    }
  });

  edges.forEach((edge) => {
    if (graph.edges) {
      const elkEdge: ElkExtendedEdge = {
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      };
      graph.edges.push(elkEdge);
    }
  });

  return elk.layout(graph).then((layoutedGraph) => {
    const nodes: Node[] = [];

    (layoutedGraph.children ?? []).map((elkNode) => {
      const node = nodeId2Node.get(elkNode.id);
      if (node) {
        node.position.x = elkNode.x ?? 0;
        node.position.y = elkNode.y ?? 0;
        nodes.push(node);
      }
    });

    return {
      nodes,
    };
  });
};
