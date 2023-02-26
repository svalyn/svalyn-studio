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

import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import InsertChartOutlinedOutlinedIcon from '@mui/icons-material/InsertChartOutlinedOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useRef, useState } from 'react';
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Viewer } from '../viewers/Viewer';
import { Domains } from './domains/Domains';
import { Explorer } from './explorer/Explorer';
import { TabBar } from './tabs/TabBar';
import { ActivityBar } from './viewcontainer/ActivityBar';
import { ViewDescription } from './viewcontainer/ActivityBar.types';
import { Resource, WorkbenchProps, WorkbenchState } from './Workbench.types';

export const Workbench = ({ changeId }: WorkbenchProps) => {
  const [state, setState] = useState<WorkbenchState>({
    selectedViewId: 'explorer',
    viewPanelState: 'EXPANDED',
    openResources: [],
    currentResource: null,
  });

  const panelRef = useRef<ImperativePanelHandle>(null);
  const theme = useTheme();

  const onSelectedView = (view: ViewDescription) => {
    if (state.selectedViewId === view.id && panelRef.current) {
      if (state.viewPanelState === 'EXPANDED') {
        panelRef.current.collapse();
        setState((prevState) => ({ ...prevState, viewPanelState: 'COLLAPSED' }));
      } else {
        panelRef.current.expand();
        setState((prevState) => ({ ...prevState, viewPanelState: 'EXPANDED' }));
      }
    } else {
      setState((prevState) => ({ ...prevState, selectedViewId: view.id }));
    }
  };

  const onCollapse = (collapsed: boolean) => {
    setState((prevState) => ({ ...prevState, viewPanelState: collapsed ? 'COLLAPSED' : 'EXPANDED' }));
  };

  const onResourceClick = (resource: Resource) => {
    setState((prevState) => {
      const resourceAlreadyOpen =
        prevState.openResources.filter((openResource) => resource.id === openResource.id).length > 0;
      if (resourceAlreadyOpen) {
        return { ...prevState, currentResource: resource };
      }
      return { ...prevState, currentResource: resource, openResources: [...prevState.openResources, resource] };
    });
  };

  const onOpen = (resource: Resource) => {
    setState((prevState) => ({ ...prevState, currentResource: resource }));
  };

  const onClose = (event: React.MouseEvent<SVGSVGElement, MouseEvent>, resource: Resource) => {
    event.stopPropagation();

    setState((prevState) => {
      let currentResource: Resource | null = prevState.currentResource;
      if (currentResource) {
        if (prevState.openResources.length === 1 && prevState.openResources[0] === resource) {
          // We will close the only tab, nothing will be selected
          currentResource = null;
        } else if (currentResource.id === resource.id) {
          // We will close the current resource among multiple open resources
          const index: number = prevState.openResources.indexOf(resource);
          if (index === 0 && prevState.openResources.length > 1) {
            // We will close the first tab, let's select the second one
            currentResource = prevState.openResources[1];
          } else if (index > 0 && index === prevState.openResources.length - 1) {
            // We will close the last tab, let's select the one before
            currentResource = prevState.openResources[index - 1];
          } else if (index > 0 && index < prevState.openResources.length - 1) {
            // We will close a tab in the middle, let's select the previous one
            currentResource = prevState.openResources[index - 1];
          }
        }
      }

      const openResources = prevState.openResources.filter((openResource) => openResource.id !== resource.id);
      return { ...prevState, openResources, currentResource };
    });
  };

  const views: ViewDescription[] = [
    { id: 'explorer', title: 'Explorer', icon: InsertDriveFileOutlinedIcon },
    { id: 'domains', title: 'Domains', icon: HubOutlinedIcon },
    { id: 'objects', title: 'Objects', icon: LanOutlinedIcon },
    { id: 'views', title: 'Views', icon: InsertChartOutlinedOutlinedIcon },
  ];

  return (
    <Box
      data-testid="workbench"
      sx={{ display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: 'min-content 1fr' }}
    >
      <Box
        data-testid="header"
        sx={{
          height: (theme) => theme.spacing(4),
          backgroundColor: (theme) => theme.palette.background.paper,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      ></Box>
      <PanelGroup direction="horizontal">
        <ActivityBar views={views} selectedViewId={state.selectedViewId} onClick={onSelectedView} />
        <Panel
          style={{ display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}
          minSize={10}
          maxSize={50}
          defaultSize={20}
          collapsible
          onCollapse={onCollapse}
          ref={panelRef}
        >
          {state.selectedViewId === 'explorer' && <Explorer changeId={changeId} onResourceClick={onResourceClick} />}
          {state.selectedViewId !== 'explorer' && <Domains />}
        </Panel>
        <PanelResizeHandle
          style={{
            width: '0.1rem',
            outline: 'none',
            transition: '250ms linear background-color',
            backgroundColor: theme.palette.divider,
          }}
        />
        <Panel style={{ display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: 'min-content 1fr' }}>
          <TabBar
            resources={state.openResources}
            currentResourceId={state.currentResource?.id || ''}
            onOpen={onOpen}
            onClose={onClose}
          />
          <Box
            data-testid="editor-area"
            sx={{
              overflow: 'scroll',
              padding: (theme) => theme.spacing(1),
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            {state.currentResource && (
              <Viewer changeId={changeId} path={state.currentResource.path} name={state.currentResource.name} />
            )}
          </Box>
        </Panel>
      </PanelGroup>
    </Box>
  );
};
