/*
 * Copyright (c) 2022 Stéphane Bégaudeau.
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

import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useCallback } from 'react';
import ReactFlow, { addEdge, Background, Connection, Controls, MiniMap, useEdgesState, useNodesState } from 'reactflow';
import { Graph, GraphViewerProps } from './GraphViewer.types';

import 'reactflow/dist/style.css';

export const GraphViewer = ({ resource, downloadURL }: GraphViewerProps) => {
  let graph: Graph = {
    nodes: [],
    edges: [],
  };
  try {
    graph = JSON.parse(resource.content);
  } catch {
    console.log('Cannot parse the given content as JSON');
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  return (
    <Paper
      id={resource.id}
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: (theme) => theme.spacing(2),
          py: '2px',
        }}
      >
        <Typography variant="subtitle1">{resource.name}</Typography>
        <div>
          <IconButton component="a" type="application/octet-stream" href={downloadURL}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </div>
      </Box>
      <Divider />
      <Box sx={{ height: '800px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodesDraggable={false}
          nodesConnectable={false}
          fitView
        >
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
          <Background />
        </ReactFlow>
      </Box>
    </Paper>
  );
};
