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

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { useConsole } from '../console/useConsole';
import { UseCase, UseCasesPanelProps } from './UseCasesPanel.types';

const theExpanse: UseCase = {
  name: 'The Expanse',
  tasks: [
    { type: 'CreateOrganizationTask', identifier: 'un', name: 'United Nations' },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'un',
      identifier: 'agatha-king',
      name: 'Agatha King',
      description: 'The UNN Agatha King was a Truman-class dreadnought of the United Nations Navy (UNN)',
    },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'un',
      identifier: 'tripoli',
      name: 'Tripoli',
      description:
        'The UNN Tripoli was a Truman-class dreadnought assigned to the ring gate fleet to protect the Sol Gate',
    },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'un',
      identifier: 'thomas-prince',
      name: 'Thomas Prince',
      description: 'The UNN Thomas Prince is a Xerces-class battleship used by the UNN to cross into The Ring',
    },
    { type: 'CreateOrganizationTask', identifier: 'mcrn', name: 'Mars Congressional Republic Navy' },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'mcrn',
      identifier: 'donnager',
      name: 'Donnager',
      description:
        'The MCRN Donnager was the flagship of the Jupiter fleet under orders of the Martian Congressional Republic Navy',
    },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'mcrn',
      identifier: 'scirocco',
      name: 'Scirocco',
      description:
        'The MCRN Scirocco is a Scirocco-class assault cruiser in the MCRN and is also the namesake of its class of warship',
    },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'mcrn',
      identifier: 'hammurabi',
      name: 'Hammurabi',
      description:
        'The MCRN Hammurabi is a Scirocco-class assault cruiser of the MCRN which has been engaged at Io during the UN-MCR war',
    },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'mcrn',
      identifier: 'donnager',
      name: 'Donnager',
      description:
        'The MCRN Donnager was the flagship of the Jupiter fleet under orders of the Martian Congressional Republic Navy',
    },
    { type: 'CreateOrganizationTask', identifier: 'tycho', name: 'Tycho Station' },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'tycho',
      identifier: 'Nauvoo',
      name: 'Nauvoo',
      description:
        'The LDSS Nauvoo later known as the OPAS Behemoth and then Medina Station is a generation ship constructed at Tycho Station',
    },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'tycho',
      identifier: 'rocinante',
      name: 'Rocinante',
      description:
        'The Rocinante is a former MCRN turned independant Corvette-class frigate capable of multiple combat roles',
    },
    { type: 'CreateOrganizationTask', identifier: 'ceres', name: 'Ceres Station' },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'ceres',
      identifier: 'canterbury',
      name: 'Canterbury',
      description:
        'The Canterbury was a former colony ship which was converted to function as an ice hauler traveling among the Belt and the Outer Planets',
    },
    { type: 'CreateOrganizationTask', identifier: 'protogene', name: 'Protogene' },
    {
      type: 'CreateProjectTask',
      organizationIdentifier: 'protogene',
      identifier: 'razorback',
      name: 'Razorback',
      description: 'Transplanetary racing pinnacle used by Julie Mao and owned by her father Jules-Pierre Mao',
    },
  ],
  rollbackTasks: [
    { type: 'DeleteOrganizationTask', identifier: 'un' },
    { type: 'DeleteOrganizationTask', identifier: 'mcrn' },
    { type: 'DeleteOrganizationTask', identifier: 'tycho' },
    { type: 'DeleteOrganizationTask', identifier: 'ceres' },
    { type: 'DeleteOrganizationTask', identifier: 'protogene' },
  ],
};

export const UseCasesPanel = ({ onExecute, onRollback }: UseCasesPanelProps) => {
  const { clearMessages } = useConsole();

  return (
    <List disablePadding sx={{ borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
      <ListItem
        disableGutters
        sx={{
          paddingX: (theme) => theme.spacing(1),
          '&.MuiListItem-secondaryAction': { paddingRight: '96px' },
        }}
      >
        <ListItemText primary="The Expanse" />
        <ListItemSecondaryAction>
          <IconButton
            onClick={() => {
              clearMessages();
              onExecute(theExpanse);
            }}
          >
            <PlayCircleOutlineIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              clearMessages();
              onRollback(theExpanse);
            }}
          >
            <CancelOutlinedIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};
