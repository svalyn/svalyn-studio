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
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { EditReadMeDialog } from '../../dialogs/EditReadMeDialog';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import {
  ErrorPayload,
  ProjectReadMeCardProps,
  ProjectReadMeCardState,
  UpdateProjectReadMeData,
  UpdateProjectReadMeVariables,
} from './ProjectReadMeCard.types';

const updateProjectReadMeMutation = gql`
  mutation updateProjectReadMe($input: UpdateProjectReadMeInput!) {
    updateProjectReadMe(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

const trimLines = (content: string): string =>
  content
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

export const ProjectReadMeCard = ({ projectIdentifier, readMe, role, onReadMeUpdate }: ProjectReadMeCardProps) => {
  const [state, setState] = useState<ProjectReadMeCardState>({
    editReadMeDialogOpen: false,
    message: null,
  });

  const openReadMeDialog = () => setState((prevState) => ({ ...prevState, editReadMeDialogOpen: true }));
  const closeReadMeDialog = () => setState((prevState) => ({ ...prevState, editReadMeDialogOpen: false }));

  const [
    updateProjectReadMe,
    { loading: updateProjectReadMeLoading, data: updateProjectReadMeData, error: updateProjectReadMeError },
  ] = useMutation<UpdateProjectReadMeData, UpdateProjectReadMeVariables>(updateProjectReadMeMutation);
  useEffect(() => {
    if (!updateProjectReadMeLoading) {
      if (updateProjectReadMeData) {
        const { updateProjectReadMe } = updateProjectReadMeData;
        if (updateProjectReadMe.__typename === 'SuccessPayload') {
          onReadMeUpdate();
        } else if (updateProjectReadMe.__typename === 'ErrorPayload') {
          const errorPayload = updateProjectReadMe as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message, editReadMeDialogOpen: false }));
        }
      }
      if (updateProjectReadMeError) {
        setState((prevState) => ({
          ...prevState,
          message: updateProjectReadMeError.message,
          editReadMeDialogOpen: false,
        }));
      }
    }
  }, [updateProjectReadMeLoading, updateProjectReadMeData, updateProjectReadMeError]);

  const handleReadMeUpdate = (value: string) => {
    const variables: UpdateProjectReadMeVariables = {
      input: {
        id: crypto.randomUUID(),
        projectIdentifier,
        content: value,
      },
    };
    updateProjectReadMe({ variables });
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));
  const trimmedReadMe = trimLines(readMe);

  return (
    <>
      <Paper variant="outlined">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: (theme) => theme.spacing(2),
            py: '2px',
          }}
        >
          <Typography variant="subtitle1">README.md</Typography>
          <div>
            <IconButton sx={{ marginRight: '4px' }} onClick={openReadMeDialog} disabled={role === 'NONE'}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton component="a" download="README.md" href={URL.createObjectURL(new Blob([trimmedReadMe]))}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </div>
        </Box>
        <Divider />
        <Box sx={{ px: (theme) => theme.spacing(2), py: (theme) => theme.spacing(1) }}>
          <ReactMarkdown children={trimmedReadMe} />
        </Box>
      </Paper>
      <EditReadMeDialog
        content={trimmedReadMe}
        open={state.editReadMeDialogOpen}
        onCancel={closeReadMeDialog}
        onUpdate={handleReadMeUpdate}
      />
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
