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
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { hasMinLength, isIdentifier, useForm } from '../forms/useForm';
import { Navbar } from '../navbars/Navbar';
import { NewOrganizationViewFormData } from './NewOrganizationView.types';
import { useCreateOrganization } from './useCreateOrganization';
import { CreateOrganizationInput } from './useCreateOrganization.types';

export const NewOrganizationView = () => {
  const { data, isFormValid, getTextFieldProps } = useForm<NewOrganizationViewFormData>({
    initialValue: {
      name: '',
      organizationId: '',
    },
    validationRules: {
      name: (data) => hasMinLength(data.name, 1),
      organizationId: (data) => isIdentifier(data.organizationId),
    },
  });

  const { enqueueSnackbar } = useSnackbar();

  const [createOrganization, { organization, message }] = useCreateOrganization();
  useEffect(() => {
    if (message) {
      enqueueSnackbar(message.body, { variant: message.severity });
    }
  }, [message]);

  const handleCreateOrganization: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const input: CreateOrganizationInput = {
      id: crypto.randomUUID(),
      identifier: data.organizationId,
      name: data.name,
    };
    createOrganization(input);
  };

  if (organization) {
    return <Navigate to={`/orgs/${organization.identifier}`} />;
  }

  return (
    <div>
      <Navbar />
      <div>
        <Container maxWidth="sm">
          <Toolbar />
          <Paper variant="outlined" sx={{ padding: (theme) => theme.spacing(2) }}>
            <form onSubmit={handleCreateOrganization}>
              <Stack spacing={4}>
                <Typography variant="h4" align="center">
                  Let's create your organization
                </Typography>
                <TextField
                  {...getTextFieldProps('name', "This is where you'll manage your domains")}
                  label="Organization Name"
                  variant="outlined"
                  autoFocus
                  required
                  inputProps={{
                    'aria-label': 'Organization Name',
                  }}
                />
                <TextField
                  {...getTextFieldProps(
                    'organizationId',
                    'A unique identifier composed of letters, numbers, dashes and underscores'
                  )}
                  label="Organization Identifier"
                  variant="outlined"
                  required
                  inputProps={{
                    'aria-label': 'Organization Identifier',
                  }}
                />
                <Button type="submit" variant="contained" startIcon={<CorporateFareIcon />} disabled={!isFormValid}>
                  Create organization
                </Button>
                <Link component={RouterLink} to="/" variant="body2" underline="hover" align="center">
                  Back to the homepage
                </Link>
              </Stack>
            </form>
          </Paper>
        </Container>
      </div>
    </div>
  );
};
