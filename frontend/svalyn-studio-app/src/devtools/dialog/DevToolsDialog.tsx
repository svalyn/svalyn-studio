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

import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import { Ref, forwardRef, useState } from 'react';
import { PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ConsoleContextProvider } from '../console/ConsoleContextProvider';
import { UseCase } from '../usecases/UseCasesPanel.types';
import { DevToolsDialogProps, DevToolsDialogState } from './DevToolsDialog.types';
import { LeftSite, RightSite } from './Site';
import { TaskRunner } from './TaskRunner';

const Transition = forwardRef((props: TransitionProps & { children: React.ReactElement }, ref: Ref<unknown>) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const DevToolsDialog = ({ open, onClose }: DevToolsDialogProps) => {
  const theme = useTheme();
  const [state, setState] = useState<DevToolsDialogState>({
    tasksToExecute: null,
  });

  const handleTaskCompleted = () => setState((prevState) => ({ ...prevState, tasksToExecute: null }));

  const handleExecute = (useCase: UseCase) => {
    setState((prevState) => ({ ...prevState, tasksToExecute: useCase.tasks }));
  };

  const handleRollback = (useCase: UseCase) => {
    setState((prevState) => ({ ...prevState, tasksToExecute: useCase.rollbackTasks }));
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      transitionDuration={500}
      PaperProps={{
        sx: {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridTemplateRows: 'min-content 1fr',
        },
      }}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar variant="dense">
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: (theme) => theme.spacing(2) }}>
            <IconButton onClick={onClose} color="inherit">
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6">Devtools</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <ConsoleContextProvider>
        <Box>
          <PanelGroup direction="horizontal">
            <LeftSite onExecute={handleExecute} onRollback={handleRollback} />
            <PanelResizeHandle
              style={{
                width: '0.1rem',
                outline: 'none',
                transition: '250ms linear background-color',
                backgroundColor: theme.palette.divider,
              }}
            />
            <RightSite />
          </PanelGroup>

          {state.tasksToExecute !== null ? (
            <TaskRunner tasks={state.tasksToExecute} onTaskCompleted={handleTaskCompleted} />
          ) : null}
        </Box>
      </ConsoleContextProvider>
    </Dialog>
  );
};
