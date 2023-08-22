/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonIcon from '@mui/icons-material/Person';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';
import { useOrganization } from '../useOrganization';
import { Invitations } from './Invitations';
import { InviteMemberDialog } from './InviteMemberDialog';
import { LeaveOrganizationDialog } from './LeaveOrganizationDialog';
import { Memberships } from './Memberships';
import { OrganizationMembersViewState, OrganizationMemberTab } from './OrganizationMembersView.types';

export const OrganizationMembersView = () => {
  const {
    organization: { identifier: organizationIdentifier, role },
  } = useOrganization();
  const [state, setState] = useState<OrganizationMembersViewState>({
    tab: 'Memberships',
    inviteMemberDialogOpen: false,
    leaveOrganizationDialogOpen: false,
    timestamp: Date.now(),
  });

  const selectTab = (tab: OrganizationMemberTab) => setState((prevState) => ({ ...prevState, tab }));

  const openInviteMemberDialog: React.MouseEventHandler<HTMLButtonElement> = () => {
    setState((prevState) => ({ ...prevState, inviteMemberDialogOpen: true }));
  };
  const closeInviteMemberDialog = () => {
    setState((prevState) => ({ ...prevState, inviteMemberDialogOpen: false, timestamp: Date.now() }));
  };

  const openLeaveOrganizationDialog: React.MouseEventHandler<HTMLButtonElement> = () => {
    setState((prevState) => ({ ...prevState, leaveOrganizationDialogOpen: true }));
  };
  const closeLeaveOrganizationDialog = () => {
    setState((prevState) => ({ ...prevState, leaveOrganizationDialogOpen: false }));
  };

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '1fr',
          gridTemplateColumns: '1fr 5fr',
          gap: (theme) => theme.spacing(2),
          paddingX: (theme) => theme.spacing(2),
        }}
      >
        <Box sx={{ paddingY: (theme) => theme.spacing(1) }}>
          <List>
            <ListItem disablePadding selected={state.tab === 'Memberships'} onClick={() => selectTab('Memberships')}>
              <ListItemButton>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Members" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding selected={state.tab === 'Invitations'} onClick={() => selectTab('Invitations')}>
              <ListItemButton>
                <ListItemIcon>
                  <MailOutlineIcon />
                </ListItemIcon>
                <ListItemText primary="Invitations" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <Box sx={{ paddingY: (theme) => theme.spacing(2) }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'start',
              justifyContent: 'end',
              gap: (theme) => theme.spacing(2),
              paddingBottom: (theme) => theme.spacing(2),
            }}
          >
            <Button variant="outlined" onClick={openInviteMemberDialog} disabled={role !== 'ADMIN'}>
              Invite member
            </Button>
            <Button variant="outlined" onClick={openLeaveOrganizationDialog} disabled={role !== 'ADMIN'}>
              Leave organization
            </Button>
          </Box>
          {state.tab === 'Memberships' ? (
            <Memberships organizationIdentifier={organizationIdentifier} role={role} />
          ) : null}
          {state.tab === 'Invitations' ? (
            <Invitations organizationIdentifier={organizationIdentifier} role={role} key={state.timestamp} />
          ) : null}
        </Box>
      </Box>
      {state.inviteMemberDialogOpen ? (
        <InviteMemberDialog
          organizationIdentifier={organizationIdentifier}
          open={state.inviteMemberDialogOpen}
          onClose={closeInviteMemberDialog}
        />
      ) : null}
      {state.leaveOrganizationDialogOpen ? (
        <LeaveOrganizationDialog
          organizationIdentifier={organizationIdentifier}
          open={state.leaveOrganizationDialogOpen}
          onClose={closeLeaveOrganizationDialog}
        />
      ) : null}
    </>
  );
};
