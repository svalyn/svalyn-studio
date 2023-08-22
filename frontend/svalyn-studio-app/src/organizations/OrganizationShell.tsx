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

import { gql, useQuery } from '@apollo/client';
import ClassIcon from '@mui/icons-material/Class';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../navbars/Navbar';
import { NotFoundView } from '../notfound/NotFoundView';
import { NewProjectDialog } from './NewProjectDialog';
import { OrganizationPicker } from './OrganizationPicker';
import {
  GetOrganizationData,
  GetOrganizationVariables,
  OrganizationShellProps,
  OrganizationShellState,
} from './OrganizationShell.types';
import { OrganizationTabs } from './OrganizationTabs';
import { OrganizationContext } from './useOrganization';

const getOrganizationQuery = gql`
  query getOrganization($identifier: ID!) {
    viewer {
      organization(identifier: $identifier) {
        identifier
        name
        role
      }
    }
  }
`;

export const OrganizationShell = ({ children }: OrganizationShellProps) => {
  const [state, setState] = useState<OrganizationShellState>({
    newProjectDialogOpen: false,
  });

  const { enqueueSnackbar } = useSnackbar();

  const { organizationIdentifier } = useParams();
  const variables: GetOrganizationVariables = { identifier: organizationIdentifier ?? '' };
  const { data, error } = useQuery<GetOrganizationData, GetOrganizationVariables>(getOrganizationQuery, {
    variables,
  });
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  const openNewProjectDialog = () => setState((prevState) => ({ ...prevState, newProjectDialogOpen: true }));
  const closeNewProjectDialog = () => setState((prevState) => ({ ...prevState, newProjectDialogOpen: false }));

  if (!data) {
    return null;
  }
  if (!data.viewer.organization) {
    return <NotFoundView />;
  }

  return (
    <>
      <div>
        <Navbar>
          <OrganizationPicker organization={data.viewer.organization} />
        </Navbar>
        <Toolbar
          sx={{
            backgroundColor: 'white',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: (theme) => theme.spacing(2),
            }}
          >
            <CorporateFareIcon fontSize="large" />
            <Typography variant="h4" sx={{ marginRight: '2rem' }}>
              {data.viewer.organization.name}
            </Typography>
          </Box>
          <OrganizationTabs
            organizationIdentifier={data.viewer.organization.identifier}
            sx={{ alignSelf: 'flex-end' }}
          />
          <Button
            variant="contained"
            sx={{ marginLeft: 'auto' }}
            size="small"
            startIcon={<ClassIcon />}
            onClick={openNewProjectDialog}
            disabled={data.viewer.organization.role === 'NONE'}
          >
            New Project
          </Button>
        </Toolbar>

        <OrganizationContext.Provider value={{ organization: data.viewer.organization }}>
          {children}
        </OrganizationContext.Provider>
      </div>
      {state.newProjectDialogOpen ? (
        <NewProjectDialog
          organizationIdentifier={data.viewer.organization.identifier}
          open={state.newProjectDialogOpen}
          onClose={closeNewProjectDialog}
        />
      ) : null}
    </>
  );
};
