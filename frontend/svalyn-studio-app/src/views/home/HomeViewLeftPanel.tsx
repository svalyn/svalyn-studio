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
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import {
  GetOrganizationsData,
  GetOrganizationsVariables,
  HomeViewLeftPanelProps,
  HomeViewLeftPanelState,
} from './HomeViewLeftPanel.types';

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

export const HomeViewLeftPanel = ({}: HomeViewLeftPanelProps) => {
  const [state, setState] = useState<HomeViewLeftPanelState>({
    message: null,
  });

  const { data, error } = useQuery<GetOrganizationsData, GetOrganizationsVariables>(getOrganizationsQuery);
  useEffect(() => {
    if (error) {
      setState((prevState) => ({ ...prevState, message: error.message }));
    }
  }, [error]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const organizations = data?.viewer.organizations.edges.map((edge) => edge.node) ?? [];
  return (
    <>
      <Paper
        elevation={0}
        square
        sx={{
          paddingY: (theme) => theme.spacing(1),
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingX: (theme) => theme.spacing(2),
            paddingBottom: (theme) => theme.spacing(1),
          }}
        >
          <Typography variant="h6">Organizations</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<CorporateFareIcon />}
            component={RouterLink}
            to="/new/organization"
          >
            New
          </Button>
        </Box>
        {data && organizations.length > 0 ? (
          <List disablePadding dense>
            {organizations.map((organization) => {
              return (
                <ListItem disablePadding key={organization.identifier}>
                  <ListItemButton component={RouterLink} to={`/orgs/${organization.identifier}`}>
                    <ListItemIcon>
                      <CorporateFareIcon />
                    </ListItemIcon>
                    <ListItemText primary={organization.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="body2" sx={{ paddingX: (theme) => theme.spacing(2) }}>
            No organization found
          </Typography>
        )}
      </Paper>
      <ErrorSnackbar open={!!state.message} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
