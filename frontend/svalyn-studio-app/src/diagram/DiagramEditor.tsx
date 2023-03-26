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

import { NodeTypes, ReactFlow, useEdgesState, useNodesState } from 'reactflow';
import { DiagramEditorProps, DiagramEditorRendererProps, DiagramEditorState } from './DiagramEditor.types';
import { ListNode } from './nodes/ListNode';

import { useEffect, useState } from 'react';
import 'reactflow/dist/style.css';
import { afterLayout, beforeLayout, performLayout } from './layout';

const nodeTypes: NodeTypes = {
  listNode: ListNode,
};

export const DiagramEditor = ({ diagram }: DiagramEditorProps) => {
  const [state, setState] = useState<DiagramEditorState>({
    currentStep: 'BEFORE_LAYOUT',
    root: null,
    diagram,
  });

  useEffect(() => {
    if (state.currentStep === 'BEFORE_LAYOUT') {
      const root = beforeLayout(state.diagram);
      const currentStep = 'LAYOUT';
      setState((prevState) => ({ ...prevState, currentStep, root }));
    }
  }, [state.currentStep]);

  useEffect(() => {
    if (state.currentStep === 'LAYOUT' && state.root) {
      const layoutedDiagram = performLayout(state.diagram);
      const currentStep = 'AFTER_LAYOUT';
      setState((prevState) => ({ ...prevState, currentStep, diagram: layoutedDiagram }));
    }
    return () => {
      if (state.root) {
        afterLayout(state.root);
        const currentStep = 'RENDERING';
        setState((prevState) => ({ ...prevState, currentStep, root: null }));
      }
    };
  }, [state.currentStep]);

  return (
    <div style={{ height: 800 }}>
      {state.currentStep === 'RENDERING' ? <DiagramEditorRenderer diagram={state.diagram} /> : null}
    </div>
  );
};

const DiagramEditorRenderer = ({ diagram }: DiagramEditorRendererProps) => {
  const [nodes] = useNodesState(diagram.nodes);
  const [edges] = useEdgesState(diagram.edges);

  const style = {
    backgroundColor: 'white',
    border: 'black',
  };

  return <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} style={style} fitView />;
};
