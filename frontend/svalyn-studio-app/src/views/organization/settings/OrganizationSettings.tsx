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

import { gql, useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import { DeleteOrganizationDialog } from './DeleteOrganizationDialog';
import {
  ErrorPayload,
  OrganizationSettingsProps,
  OrganizationSettingsState,
  RenameOrganizationData,
  RenameOrganizationVariables,
} from './OrganizationSettings.types';

const renameOrganizationMutation = gql`
  mutation renameOrganization($input: RenameOrganizationInput!) {
    renameOrganization(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const OrganizationSettings = ({ organizationIdentifier }: OrganizationSettingsProps) => {
  const [state, setState] = useState<OrganizationSettingsState>({
    name: '',
    message: null,
    deleteOrganizationDialogOpen: false,
  });

  const navigate = useNavigate();

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, name: value }));
  };

  const [
    renameOrganization,
    { loading: renameOrganizationLoading, data: renameOrganizationData, error: renameOrganizationError },
  ] = useMutation<RenameOrganizationData, RenameOrganizationVariables>(renameOrganizationMutation);
  useEffect(() => {
    if (!renameOrganizationLoading) {
      if (renameOrganizationData) {
        if (renameOrganizationData.renameOrganization.__typename === 'RenameOrganizationSuccessPayload') {
          navigate(`/orgs/${organizationIdentifier}`);
        } else if (renameOrganizationData.renameOrganization.__typename === 'ErrorPayload') {
          const { message } = renameOrganizationData.renameOrganization as ErrorPayload;
          setState((prevState) => ({ ...prevState, message }));
        }
      }
      if (renameOrganizationError) {
        setState((prevState) => ({ ...prevState, message: renameOrganizationError.message }));
      }
    }
  }, [renameOrganizationLoading, renameOrganizationData, renameOrganizationError]);

  const handleRename: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: RenameOrganizationVariables = {
      input: {
        organizationIdentifier,
        name: state.name,
      },
    };

    renameOrganization({ variables });
  };

  const openDeleteOrganizationDialog: React.MouseEventHandler<HTMLButtonElement> = () => {
    setState((prevState) => ({ ...prevState, deleteOrganizationDialogOpen: true }));
  };
  const closeDeleteOrganizationDialog = () => {
    setState((prevState) => ({ ...prevState, deleteOrganizationDialogOpen: false }));
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <Container maxWidth="lg">
        <Paper sx={{ padding: (theme) => theme.spacing(3), marginTop: (theme) => theme.spacing(4) }}>
          <Typography variant="h5" gutterBottom>
            General
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: (theme) => theme.spacing(2),
              marginTop: (theme) => theme.spacing(2),
            }}
          >
            <TextField
              label="Organization name"
              variant="outlined"
              size="small"
              fullWidth
              value={state.name}
              onChange={handleNameChange}
            />
            <Button variant="outlined" onClick={handleRename}>
              Rename
            </Button>
          </Box>
        </Paper>
        <Paper sx={{ padding: (theme) => theme.spacing(3), marginTop: (theme) => theme.spacing(4) }}>
          <Typography variant="h5" gutterBottom>
            Delete this organization
          </Typography>
          <Typography gutterBottom>
            Once you delete an organization, there is no going back. Please be certain.
          </Typography>
          <Button variant="outlined" onClick={openDeleteOrganizationDialog}>
            Delete organization
          </Button>
        </Paper>
      </Container>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
      {state.deleteOrganizationDialogOpen ? (
        <DeleteOrganizationDialog
          open={state.deleteOrganizationDialogOpen}
          onClose={closeDeleteOrganizationDialog}
          organizationIdentifier={organizationIdentifier}
        />
      ) : null}
    </>
  );
};
