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
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper, { PaperProps } from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import {
  CreateOrganizationData,
  CreateOrganizationInput,
  CreateOrganizationSuccessPayload,
  CreateOrganizationVariables,
  ErrorPayload,
  NewOrganizationViewState,
} from './NewOrganizationView.types';

const createOrganizationMutation = gql`
  mutation createOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      __typename
      ... on CreateOrganizationSuccessPayload {
        organization {
          identifier
        }
      }
      ... on ErrorPayload {
        message
      }
    }
  }
`;

const Area = styled(Paper)<PaperProps>(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const NewOrganizationView = () => {
  const [state, setState] = useState<NewOrganizationViewState>({
    name: '',
    organizationId: '',
    isFormValid: false,
    createdOrganization: null,
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

  const [createOrganization, { loading, data, error }] = useMutation<
    CreateOrganizationData,
    CreateOrganizationVariables
  >(createOrganizationMutation);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const { createOrganization } = data;
        if (createOrganization.__typename === 'CreateOrganizationSuccessPayload') {
          const createOrganizationSuccessPayload = createOrganization as CreateOrganizationSuccessPayload;
          setState((prevState) => ({
            ...prevState,
            createdOrganization: createOrganizationSuccessPayload.organization,
          }));
        } else if (createOrganization.__typename === 'ErrorPayload') {
          const errorPayload = createOrganization as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const handleCreateOrganization: React.MouseEventHandler<HTMLButtonElement> = () => {
    const input: CreateOrganizationInput = {
      identifier: state.organizationId,
      name: state.name,
    };
    createOrganization({ variables: { input } });
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (state.createdOrganization) {
    return <Navigate to={`/orgs/${state.createdOrganization.identifier}`} />;
  }

  return (
    <>
      <div>
        <Navbar />
        <div>
          <Container maxWidth="sm">
            <Toolbar />
            <Area variant="outlined">
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
                />
                <TextField
                  label="Organization Identifier"
                  helperText="A unique identifier composed of letters, numbers and dashes"
                  value={state.organizationId}
                  onChange={handleOrganizationIdChanged}
                  variant="outlined"
                  required
                />
                <Button variant="contained" onClick={handleCreateOrganization} disabled={!state.isFormValid}>
                  Create
                </Button>
                <Link component={RouterLink} to="/" variant="body2" underline="hover" align="center">
                  Back to the homepage
                </Link>
              </Stack>
            </Area>
          </Container>
        </div>
      </div>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
