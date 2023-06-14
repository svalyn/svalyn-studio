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

import { LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import { DiagramEditorProps, DiagramEditorRendererProps, DiagramEditorRendererState } from './DiagramEditor.types';
import { performLayout } from './layout';
import { ListNode } from './nodes/ListNode';

import 'reactflow/dist/style.css';
import { DiagramPanel } from './DiagramPanel';

const nodeTypes: NodeTypes = {
  listNode: ListNode,
};

export const DiagramEditor = ({ diagram }: DiagramEditorProps) => {
  return (
    <div style={{ height: 800 }}>
      <ReactFlowProvider>
        <DiagramEditorRenderer diagram={diagram} />
      </ReactFlowProvider>
    </div>
  );
};

const DiagramEditorRenderer = ({ diagram }: DiagramEditorRendererProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<DiagramEditorRendererState>({
    fullscreen: false,
  });
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(diagram.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(diagram.edges);

  const nodesInitialized = useNodesInitialized({ includeHiddenNodes: true });

  const layout = useCallback(() => {
    const layoutOptions: LayoutOptions = {
      'elk.algorithm': 'layered',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.spacing.nodeNode': '80',
      'elk.direction': 'DOWN',
    };
    performLayout(nodes, edges, layoutOptions).then(({ nodes }) => {
      setNodes(nodes);
    });
  }, [nodes, edges]);

  useEffect(() => {
    if (nodesInitialized) {
      layout();
    }
  }, [nodesInitialized]);

  useEffect(() => {
    const onFullscreenChange = () =>
      setState((prevState) => ({ ...prevState, fullscreen: Boolean(document.fullscreenElement) }));

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleFullscreen = (active: boolean) => {
    if (ref.current) {
      if (active) {
        ref.current.requestFullscreen().then(() => {
          setState((prevState) => ({ ...prevState, fullscreen: true }));
        });
      } else {
        document.exitFullscreen().then(() => {
          setState((prevState) => ({ ...prevState, fullscreen: false }));
        });
      }
    }
  };

  const handleFitToScreen = () => fitView({ duration: 1000 });

  const style = {
    backgroundColor: 'white',
    border: 'black',
  };

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      onEdgesChange={onEdgesChange}
      style={style}
      minZoom={0.05}
      maxZoom={10}
      ref={ref}
    >
      <DiagramPanel fullscreen={state.fullscreen} onFullscreen={handleFullscreen} onFitToScreen={handleFitToScreen} />
    </ReactFlow>
  );
};
