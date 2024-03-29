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

import { gql, useMutation, useQuery } from '@apollo/client';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { EditReadMeDialog } from '../../../dialogs/EditReadMeDialog';
import { useProject } from '../../useProject';
import { ChangeProposalHeader } from './ChangeProposalHeader';
import {
  ChangeProposalOverviewViewState,
  ErrorPayload,
  GetChangeProposalData,
  GetChangeProposalVariables,
  UpdateChangeProposalReadMeData,
  UpdateChangeProposalReadMeVariables,
} from './ChangeProposalOverviewView.types';
import { ChangeProposalStatus } from './ChangeProposalStatus';

const getChangeProposalQuery = gql`
  query getChangeProposal($id: ID!) {
    viewer {
      changeProposal(id: $id) {
        id
        readMe
        status
        reviews {
          edges {
            node {
              id
              message
              status
              createdOn
              createdBy {
                name
                username
                imageUrl
              }
              lastModifiedOn
              lastModifiedBy {
                name
                username
                imageUrl
              }
            }
          }
        }
        createdOn
        createdBy {
          name
          username
          imageUrl
        }
        lastModifiedOn
        lastModifiedBy {
          name
          username
          imageUrl
        }
      }
    }
  }
`;

const updateChangeProposalReadMeMutation = gql`
  mutation updateChangeProposalReadMe($input: UpdateChangeProposalReadMeInput!) {
    updateChangeProposalReadMe(input: $input) {
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

export const ChangeProposalOverviewView = () => {
  const { changeProposalIdentifier } = useParams();
  const {
    organization: { role },
  } = useProject();
  const [state, setState] = useState<ChangeProposalOverviewViewState>({
    changeProposal: null,
    editReadMeDialogOpen: false,
  });

  const { enqueueSnackbar } = useSnackbar();

  const variables: GetChangeProposalVariables = { id: changeProposalIdentifier ?? '' };
  const { loading, data, error, refetch } = useQuery<GetChangeProposalData, GetChangeProposalVariables>(
    getChangeProposalQuery,
    {
      variables,
    }
  );
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { changeProposal },
        } = data;
        if (changeProposal) {
          setState((prevState) => ({ ...prevState, changeProposal, editReadMeDialogOpen: false }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, editReadMeDialogOpen: false }));
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  }, [loading, data, error]);

  const openReadMeDialog = () => setState((prevState) => ({ ...prevState, editReadMeDialogOpen: true }));
  const closeReadMeDialog = () => setState((prevState) => ({ ...prevState, editReadMeDialogOpen: false }));

  const [
    updateChangeProposalReadMe,
    {
      loading: updateChangeProposalReadMeLoading,
      data: updateChangeProposalReadMeData,
      error: updateChangeProposalReadMeError,
    },
  ] = useMutation<UpdateChangeProposalReadMeData, UpdateChangeProposalReadMeVariables>(
    updateChangeProposalReadMeMutation
  );
  useEffect(() => {
    if (!updateChangeProposalReadMeLoading) {
      if (updateChangeProposalReadMeData) {
        const { updateChangeProposalReadMe } = updateChangeProposalReadMeData;
        if (updateChangeProposalReadMe.__typename === 'SuccessPayload') {
          refetch(variables);
        } else if (updateChangeProposalReadMe.__typename === 'ErrorPayload') {
          const errorPayload = updateChangeProposalReadMe as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message, editReadMeDialogOpen: false }));
        }
      }
      if (updateChangeProposalReadMeError) {
        enqueueSnackbar(updateChangeProposalReadMeError.message, { variant: 'error' });
        setState((prevState) => ({
          ...prevState,
          editReadMeDialogOpen: false,
        }));
      }
    }
  }, [updateChangeProposalReadMeLoading, updateChangeProposalReadMeData, updateChangeProposalReadMeError]);

  const handleReadMeUpdate = (value: string) => {
    const variables: UpdateChangeProposalReadMeVariables = {
      input: {
        id: crypto.randomUUID(),
        changeProposalId: changeProposalIdentifier ?? '',
        content: value,
      },
    };
    updateChangeProposalReadMe({ variables });
  };

  const handleStatusUpdated = () => {
    refetch(variables);
  };

  const readMe = trimLines(state.changeProposal?.readMe ?? '');

  if (!state.changeProposal) {
    return null;
  }
  return (
    <Box sx={{ py: (theme) => theme.spacing(4) }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
          <ChangeProposalHeader changeProposal={state.changeProposal} />

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
                  <IconButton component="a" download="README.md" href={URL.createObjectURL(new Blob([readMe]))}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </div>
              </Box>
              <Divider />
              <Box sx={{ px: (theme) => theme.spacing(2), py: (theme) => theme.spacing(1) }}>
                <ReactMarkdown children={readMe} />
              </Box>
            </Paper>
            <EditReadMeDialog
              content={readMe}
              open={state.editReadMeDialogOpen}
              onCancel={closeReadMeDialog}
              onUpdate={handleReadMeUpdate}
            />
          </>
          <ChangeProposalStatus changeProposal={state.changeProposal} onStatusUpdated={handleStatusUpdated} />
        </Box>
      </Container>
    </Box>
  );
};
