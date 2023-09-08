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

import { gql, useMutation } from '@apollo/client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasMinLength, useForm } from '../../forms/useForm';
import { useProject } from '../useProject';
import {
  DescriptionFormData,
  DescriptionFormProps,
  DetailsCardProps,
  ErrorPayload,
  NameFormData,
  NameFormProps,
  UpdateProjectDescriptionData,
  UpdateProjectDescriptionVariables,
  UpdateProjectNameData,
  UpdateProjectNameVariables,
} from './DetailsCard.types';

export const DetailsCard = ({}: DetailsCardProps) => {
  return (
    <Paper sx={{ padding: (theme) => theme.spacing(2), marginTop: (theme) => theme.spacing(4) }}>
      <Typography variant="h6" gutterBottom>
        General
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr min-content',
          gridTemplateRows: 'min-content min-content',
          gap: (theme) => theme.spacing(2),
          marginTop: (theme) => theme.spacing(2),
        }}
      >
        <NameForm />
        <DescriptionForm />
      </Box>
    </Paper>
  );
};

const updateProjectNameMutation = gql`
  mutation updateProjectName($input: UpdateProjectNameInput!) {
    updateProjectName(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const NameForm = ({}: NameFormProps) => {
  const {
    identifier: projectIdentifier,
    organization: { role },
  } = useProject();

  const { data, isFormValid, getTextFieldProps } = useForm<NameFormData>({
    initialValue: {
      name: '',
    },
    validationRules: {
      name: (data) => hasMinLength(data.name, 1),
    },
  });

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [
    updateProjectName,
    { loading: updateProjectNameLoading, data: updateProjectNameData, error: updateProjectNameError },
  ] = useMutation<UpdateProjectNameData, UpdateProjectNameVariables>(updateProjectNameMutation);
  useEffect(() => {
    if (!updateProjectNameLoading) {
      if (updateProjectNameData) {
        const { updateProjectName } = updateProjectNameData;
        if (updateProjectName.__typename === 'SuccessPayload') {
          navigate(`/projects/${projectIdentifier}`);
        } else if (updateProjectName.__typename === 'ErrorPayload') {
          const errorPayload = updateProjectName as ErrorPayload;
          enqueueSnackbar(errorPayload.message, { variant: 'error' });
        }
      }
      if (updateProjectNameError) {
        enqueueSnackbar(updateProjectNameError.message, { variant: 'error' });
      }
    }
  }, [updateProjectNameLoading, updateProjectNameData, updateProjectNameError]);

  const handleUpdateProjectName: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const variables: UpdateProjectNameVariables = {
      input: {
        id: crypto.randomUUID(),
        projectIdentifier,
        name: data.name,
      },
    };
    updateProjectName({ variables });
  };

  return (
    <form
      onSubmit={handleUpdateProjectName}
      style={{
        display: 'grid',
        gridTemplateColumns: 'subgrid',
        gridTemplateRows: 'subgrid',
        gridColumnStart: '1',
        gridColumnEnd: '3',
      }}
    >
      <TextField
        {...getTextFieldProps('name')}
        label="Project name"
        variant="outlined"
        size="small"
        sx={{ gridColumnStart: '1', gridColumnEnd: '2' }}
        disabled={role === 'NONE'}
      />
      <Button
        type="submit"
        variant="outlined"
        sx={{ gridColumnStart: '2', gridColumnEnd: '3', whiteSpace: 'nowrap' }}
        disabled={!isFormValid || role === 'NONE'}
      >
        Update Name
      </Button>
    </form>
  );
};

const updateProjectDescriptionMutation = gql`
  mutation updateProjectDescription($input: UpdateProjectDescriptionInput!) {
    updateProjectDescription(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const DescriptionForm = ({}: DescriptionFormProps) => {
  const {
    identifier: projectIdentifier,
    organization: { role },
  } = useProject();

  const { data, isFormValid, getTextFieldProps } = useForm<DescriptionFormData>({
    initialValue: {
      description: '',
    },
    validationRules: {
      description: (data) => hasMinLength(data.description, 1),
    },
  });

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [
    updateProjectDescription,
    {
      loading: updateProjectDescriptionLoading,
      data: updateProjectDescriptionData,
      error: updateProjectDescriptionError,
    },
  ] = useMutation<UpdateProjectDescriptionData, UpdateProjectDescriptionVariables>(updateProjectDescriptionMutation);
  useEffect(() => {
    if (!updateProjectDescriptionLoading) {
      if (updateProjectDescriptionData) {
        const { updateProjectDescription } = updateProjectDescriptionData;
        if (updateProjectDescription.__typename === 'SuccessPayload') {
          navigate(`/projects/${projectIdentifier}`);
        } else if (updateProjectDescription.__typename === 'ErrorPayload') {
          const errorPayload = updateProjectDescription as ErrorPayload;
          enqueueSnackbar(errorPayload.message, { variant: 'error' });
        }
      }
      if (updateProjectDescriptionError) {
        enqueueSnackbar(updateProjectDescriptionError.message, { variant: 'error' });
      }
    }
  }, [updateProjectDescriptionLoading, updateProjectDescriptionData, updateProjectDescriptionError]);

  const handleUpdateProjectDescription: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const variables: UpdateProjectDescriptionVariables = {
      input: {
        id: crypto.randomUUID(),
        projectIdentifier,
        description: data.description,
      },
    };
    updateProjectDescription({ variables });
  };

  return (
    <form
      onSubmit={handleUpdateProjectDescription}
      style={{
        display: 'grid',
        gridTemplateColumns: 'subgrid',
        gridTemplateRows: 'subgrid',
        gridColumnStart: '1',
        gridColumnEnd: '3',
        alignItems: 'start',
      }}
    >
      <TextField
        {...getTextFieldProps(
          'description',
          `Help others understand your project (${data.description.length}/260 characters)`
        )}
        label="Project description"
        variant="outlined"
        size="small"
        multiline
        minRows={5}
        maxRows={5}
        inputProps={{ maxLength: 260 }}
        sx={{ gridColumnStart: '1', gridColumnEnd: '2' }}
        disabled={role === 'NONE'}
      />
      <Button
        type="submit"
        variant="outlined"
        sx={{ gridColumnStart: '2', gridColumnEnd: '3', whiteSpace: 'nowrap' }}
        disabled={!isFormValid || role === 'NONE'}
      >
        Update Description
      </Button>
    </form>
  );
};
