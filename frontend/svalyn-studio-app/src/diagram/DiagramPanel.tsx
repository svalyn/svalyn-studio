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

import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { Panel } from 'reactflow';
import { DiagramPanelProps } from './DiagramPanel.types';

export const DiagramPanel = ({ fullscreen, onFullscreen, onFitToScreen }: DiagramPanelProps) => {
  return (
    <Panel position="top-left">
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: (theme) => theme.spacing(2),
          paddingX: (theme) => theme.spacing(1),
          paddingY: (theme) => theme.spacing(0.5),
        }}
      >
        {fullscreen ? (
          <IconButton size="small" onClick={() => onFullscreen(false)}>
            <FullscreenExitIcon />
          </IconButton>
        ) : (
          <IconButton size="small" onClick={() => onFullscreen(true)}>
            <FullscreenIcon />
          </IconButton>
        )}
        <IconButton size="small" onClick={() => onFitToScreen()}>
          <FitScreenIcon />
        </IconButton>
      </Paper>
    </Panel>
  );
};
