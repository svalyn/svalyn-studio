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

import { gql, useQuery } from '@apollo/client';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import Box from '@mui/material/Box';
import Button, { ButtonProps } from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import {
  GetOrganizationsData,
  GetOrganizationsVariables,
  OrganizationPickerProps,
  OrganizationPickerState,
} from './OrganizationPicker.types';

const getOrganizationsQuery = gql`
  query getOrganizations {
    viewer {
      organizations {
        edges {
          node {
            identifier
            name
          }
        }
      }
    }
  }
`;

const ContrastButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText(theme.palette.primary.main),
  borderColor: theme.palette.getContrastText(theme.palette.primary.main),
  '&:hover': {
    borderColor: theme.palette.getContrastText(theme.palette.primary.main),
  },
}));

export const OrganizationPicker = ({ organization }: OrganizationPickerProps) => {
  const [state, setState] = useState<OrganizationPickerState>({
    organizations: [],
    selectedOrganization: organization,
    anchorElement: null,
    message: null,
  });

  useEffect(() => {
    setState((prevState) => ({ ...prevState, selectedOrganization: organization }));
  }, [organization]);

  const { loading, data, error } = useQuery<GetOrganizationsData, GetOrganizationsVariables>(getOrganizationsQuery);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { organizations },
        } = data;
        setState((prevState) => ({ ...prevState, organizations: organizations.edges.map((edge) => edge.node) }));
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const openMenu: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const { currentTarget } = event;
    setState((prevState) => ({ ...prevState, anchorElement: currentTarget }));
  };

  const closeMenu = () => setState((prevState) => ({ ...prevState, anchorElement: null }));

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      {state.selectedOrganization ? (
        <ContrastButton
          variant="outlined"
          size="small"
          color="secondary"
          endIcon={<ArrowDropDownIcon />}
          onClick={openMenu}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(1) }}>
            <CorporateFareIcon fontSize="small" /> {state.selectedOrganization.name}
          </Box>
        </ContrastButton>
      ) : null}
      <Menu open={Boolean(state.anchorElement)} anchorEl={state.anchorElement} onClose={closeMenu}>
        {state.organizations.map((organization) => (
          <MenuItem
            key={organization.identifier}
            component={RouterLink}
            to={`/orgs/${organization.identifier}`}
            onClick={closeMenu}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(1) }}>
              <CorporateFareIcon /> {organization.name}
            </Box>
          </MenuItem>
        ))}
        {state.organizations.length > 0 ? <Divider /> : null}
        <MenuItem component={RouterLink} to="/new/organization">
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create a new organization</ListItemText>
        </MenuItem>
      </Menu>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
