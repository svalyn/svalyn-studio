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

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import { Panel } from 'react-resizable-panels';
import { ConsolePanel } from '../console/ConsolePanel';
import { UseCasesPanel } from '../usecases/UseCasesPanel';
import {
  LeftPanelCandidates,
  LeftSiteProps,
  LeftSiteState,
  RightPanelCandidates,
  RightSiteProps,
  RightSiteState,
} from './Site.types';

export const LeftSite = ({ onExecute, onRollback }: LeftSiteProps) => {
  const [state, setState] = useState<LeftSiteState>({
    panelSelected: 'UseCases',
  });

  const leftPanelCandidates: LeftPanelCandidates = {
    UseCases: <UseCasesPanel onExecute={onExecute} onRollback={onRollback} />,
  };
  return (
    <Panel minSize={20} maxSize={80} defaultSize={30}>
      <Box>
        <Tabs
          value={state.panelSelected}
          onChange={(_event, panelSelected) => setState((prevState) => ({ ...prevState, panelSelected }))}
          sx={{ minHeight: (theme) => theme.spacing(5) }}
        >
          <Tab
            value="UseCases"
            label="Use Cases"
            sx={{
              minHeight: (theme) => theme.spacing(5),
              paddingX: (theme) => theme.spacing(1.5),
              paddingY: (theme) => theme.spacing(0.5),
            }}
          />
        </Tabs>
        {leftPanelCandidates[state.panelSelected]}
      </Box>
    </Panel>
  );
};

export const RightSite = ({}: RightSiteProps) => {
  const [state, setState] = useState<RightSiteState>({
    panelSelected: 'Console',
  });

  const rightPanelCandidates: RightPanelCandidates = {
    Console: <ConsolePanel />,
  };

  return (
    <Panel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: 'min-content 1fr', height: '100%' }}>
        <Tabs
          value={state.panelSelected}
          onChange={(_event, panelSelected) => setState((prevState) => ({ ...prevState, panelSelected }))}
          sx={{ minHeight: (theme) => theme.spacing(5) }}
        >
          <Tab
            value="Console"
            label="Console"
            sx={{
              minHeight: (theme) => theme.spacing(5),
              paddingX: (theme) => theme.spacing(1.5),
              paddingY: (theme) => theme.spacing(0.5),
            }}
          />
        </Tabs>
        {rightPanelCandidates[state.panelSelected]}
      </Box>
    </Panel>
  );
};
