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

import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { Navbar } from '../navbars/Navbar';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import { NewOrganizationViewState } from './NewOrganizationView.types';
import { useCreateOrganization } from './useCreateOrganization';
import { CreateOrganizationInput } from './useCreateOrganization.types';

export const NewOrganizationView = () => {
  const [state, setState] = useState<NewOrganizationViewState>({
    name: '',
    organizationId: '',
    isFormValid: false,
    message: null,
  });

  const handleNameChanged: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;

    setState((prevState) => ({
      ...prevState,
      name: value,
      isFormValid: value.length > 0 && prevState.organizationId.length > 0,
    }));
  };

  const handleOrganizationIdChanged: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({
      ...prevState,
      organizationId: value,
      isFormValid: value.length > 0 && prevState.name.length > 0,
    }));
  };

  const [createOrganization, { organization, message }] = useCreateOrganization();
  useEffect(() => {
    if (message) {
      setState((prevState) => ({ ...prevState, message: message.body }));
    }
  }, [message]);

  const handleCreateOrganization: React.MouseEventHandler<HTMLButtonElement> = () => {
    const input: CreateOrganizationInput = {
      id: crypto.randomUUID(),
      identifier: state.organizationId,
      name: state.name,
    };
    createOrganization(input);
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (organization) {
    return <Navigate to={`/orgs/${organization.identifier}`} />;
  }

  return (
    <>
      <div>
        <Navbar />
        <div>
          <Container maxWidth="sm">
            <Toolbar />
            <Paper variant="outlined" sx={{ padding: (theme) => theme.spacing(2) }}>
              <Stack spacing={4}>
                <Typography variant="h4" align="center">
                  Let's create your organization
                </Typography>
                <TextField
                  label="Organization Name"
                  helperText="This is where you'll manage your domains"
                  value={state.name}
                  onChange={handleNameChanged}
                  variant="outlined"
                  autoFocus
                  required
                  inputProps={{
                    'aria-label': 'Organization Name',
                  }}
                />
                <TextField
                  label="Organization Identifier"
                  helperText="A unique identifier composed of letters, numbers and dashes"
                  value={state.organizationId}
                  onChange={handleOrganizationIdChanged}
                  variant="outlined"
                  required
                  inputProps={{
                    'aria-label': 'Organization Identifier',
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<CorporateFareIcon />}
                  onClick={handleCreateOrganization}
                  disabled={!state.isFormValid}
                >
                  Create organization
                </Button>
                <Link component={RouterLink} to="/" variant="body2" underline="hover" align="center">
                  Back to the homepage
                </Link>
              </Stack>
            </Paper>
          </Container>
        </div>
      </div>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
