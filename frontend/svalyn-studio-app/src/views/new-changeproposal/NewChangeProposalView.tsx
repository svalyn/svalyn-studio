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

import { gql, useMutation } from '@apollo/client';
import DifferenceIcon from '@mui/icons-material/Difference';
import FolderIcon from '@mui/icons-material/Folder';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Navigate, Link as RouterLink, useParams } from 'react-router-dom';
import { getCookie } from '../../cookies/getCookie';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import {
  CreateChangeProposalData,
  CreateChangeProposalSuccessPayload,
  CreateChangeProposalVariables,
  CreateResourcesSuccessPayload,
  ErrorPayload,
  NewChangeProposalViewState,
} from './NewChangeProposalView.types';

const createChangeProposalMutation = gql`
  mutation createChangeProposal($input: CreateChangeProposalInput!) {
    createChangeProposal(input: $input) {
      __typename
      ... on CreateChangeProposalSuccessPayload {
        changeProposal {
          id
        }
      }
      ... on ErrorPayload {
        message
      }
    }
  }
`;

const humanReadable = (size: number): string => {
  const range = Math.floor(Math.log2(size) / 10);
  const unit = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb'][range];
  const value = Math.floor(size / Math.pow(1024, range));
  return `${value} ${unit}`;
};

const { VITE_BACKEND_URL } = import.meta.env;

export const NewChangeProposalView = () => {
  const [state, setState] = useState<NewChangeProposalViewState>({
    name: '',
    changeProposalId: null,
    message: null,
  });
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone();
  const { projectIdentifier } = useParams();

  const handleNameChanged: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({
      ...prevState,
      name: value,
    }));
  };

  const [createChangeProposal, { loading, data, error }] = useMutation<
    CreateChangeProposalData,
    CreateChangeProposalVariables
  >(createChangeProposalMutation);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const { createChangeProposal } = data;
        if (createChangeProposal.__typename === 'CreateChangeProposalSuccessPayload') {
          const createChangeProposalSuccessPayload = createChangeProposal as CreateChangeProposalSuccessPayload;
          setState((prevState) => ({
            ...prevState,
            changeProposalId: createChangeProposalSuccessPayload.changeProposal.id,
          }));
        } else if (createChangeProposal.__typename === 'ErrorPayload') {
          const errorPayload = createChangeProposal as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const handleCreateChangeProposal: React.MouseEventHandler<HTMLButtonElement> = () => {
    const formData = new FormData();
    for (let index = 0; index < acceptedFiles.length; index++) {
      const file = acceptedFiles[index];
      formData.append('files', file, file.name);
    }

    const csrfToken = getCookie('XSRF-TOKEN');

    const requestInit: RequestInit = {
      method: 'POST',
      body: formData,
      credentials: 'include',
      mode: 'cors',
      headers: {
        'X-XSRF-TOKEN': csrfToken,
      },
    };

    if (projectIdentifier) {
      fetch(`${VITE_BACKEND_URL}/api/resources`, requestInit)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((payload: CreateResourcesSuccessPayload) => {
          const { resourceIds } = payload;

          const variables: CreateChangeProposalVariables = {
            input: {
              id: crypto.randomUUID(),
              projectIdentifier,
              name: state.name,
              resourceIds,
            },
          };
          createChangeProposal({ variables });
        })
        .catch(() => {
          setState((prevState) => ({ ...prevState, message: 'An error has occurred while contacting the server.' }));
        });
    }
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (state.changeProposalId) {
    return <Navigate to={`/changeproposals/${state.changeProposalId}`} />;
  }

  return (
    <>
      <div>
        <Navbar />
        <div>
          <Container maxWidth="sm">
            <Toolbar />
            <Paper variant="outlined" sx={{ padding: (theme) => theme.spacing(2) }}>
              <Stack spacing={3}>
                <Typography variant="h4">Let's create a change proposal</Typography>
                <TextField
                  label="Name"
                  helperText="The change that you want to perform"
                  value={state.name}
                  onChange={handleNameChanged}
                />
                {acceptedFiles.length === 0 ? (
                  <Box
                    {...getRootProps()}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      border: (theme) => `2px dashed ${theme.palette.divider}`,
                      backgroundColor: (theme) => (isDragActive ? '#ffffff' : theme.palette.grey[100]),
                      minHeight: (theme) => theme.spacing(18),
                    }}
                  >
                    <input {...getInputProps()} />
                    <Typography align="center">Drag and drop files here or click to select files</Typography>
                  </Box>
                ) : null}
                {acceptedFiles.length > 0 ? (
                  <List>
                    {acceptedFiles.map((file) => (
                      <ListItem key={file.name}>
                        <ListItemIcon>
                          <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary={file.name} secondary={humanReadable(file.size)} />
                      </ListItem>
                    ))}
                  </List>
                ) : null}
                <Button
                  variant="contained"
                  startIcon={<DifferenceIcon />}
                  onClick={handleCreateChangeProposal}
                  disabled={acceptedFiles.length === 0}
                >
                  Create change proposal
                </Button>
                <Link
                  component={RouterLink}
                  to={`/projects/${projectIdentifier}`}
                  variant="body2"
                  underline="hover"
                  align="center"
                >
                  Back to the project
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
