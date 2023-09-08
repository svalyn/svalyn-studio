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
import TagIcon from '@mui/icons-material/Tag';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { hasMinLength, useForm } from '../../forms/useForm';
import { useProject } from '../useProject';
import {
  AddTagToProjectData,
  AddTagToProjectVariables,
  ErrorPayload,
  NewTagCardProps,
  NewTagFormData,
} from './NewTagCard.types';

const addTagToProjectMutation = gql`
  mutation addTagToProject($input: AddTagToProjectInput!) {
    addTagToProject(input: $input) {
      __typename
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const NewTagCard = ({ onTagCreated }: NewTagCardProps) => {
  const {
    identifier: projectIdentifier,
    organization: { role },
  } = useProject();

  const { data, isFormValid, reset, getTextFieldProps } = useForm<NewTagFormData>({
    initialValue: {
      key: '',
      value: '',
    },
    validationRules: {
      key: (data) => hasMinLength(data.key, 1),
      value: (data) => hasMinLength(data.value, 1),
    },
  });

  const { enqueueSnackbar } = useSnackbar();

  const [addTagToProject, { data: addTagToProjectData, error: addTagToProjectError }] = useMutation<
    AddTagToProjectData,
    AddTagToProjectVariables
  >(addTagToProjectMutation);
  useEffect(() => {
    if (addTagToProjectData) {
      if (addTagToProjectData.addTagToProject.__typename === 'ErrorPayload') {
        const errorPayload = addTagToProjectData.addTagToProject as ErrorPayload;
        enqueueSnackbar(errorPayload.message, { variant: 'error' });
      } else if (addTagToProjectData.addTagToProject.__typename === 'SuccessPayload') {
        reset();
        onTagCreated();
      }
    }
    if (addTagToProjectError) {
      enqueueSnackbar(addTagToProjectError.message, { variant: 'error' });
    }
  }, [addTagToProjectData, addTagToProjectError]);

  const handleAddTagToProject: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const variables: AddTagToProjectVariables = {
      input: {
        id: crypto.randomUUID(),
        projectIdentifier,
        key: data.key,
        value: data.value,
      },
    };
    addTagToProject({ variables });
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: (theme) => theme.spacing(2),
        padding: (theme) => theme.spacing(2),
      }}
    >
      <Typography variant="h6">Add new tag</Typography>
      <form onSubmit={handleAddTagToProject}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: '1fr',
            gridTemplateColumns: '1fr 1fr min-content',
            gap: (theme) => theme.spacing(2),
          }}
        >
          <TextField {...getTextFieldProps('key')} label="Key" size="small" disabled={role === 'NONE'} />
          <TextField {...getTextFieldProps('value')} label="Value" size="small" disabled={role === 'NONE'} />
          <Button
            variant="outlined"
            disabled={!isFormValid || role === 'NONE'}
            type="submit"
            sx={{ whiteSpace: 'nowrap' }}
            size="small"
            startIcon={<TagIcon />}
          >
            new tag
          </Button>
        </Box>
      </form>
    </Paper>
  );
};
