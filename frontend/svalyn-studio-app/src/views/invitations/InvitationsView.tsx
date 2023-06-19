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

import { gql, useMutation, useQuery } from '@apollo/client';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import {
  AcceptInvitationData,
  AcceptInvitationVariables,
  DeclineInvitationData,
  DeclineInvitationVariables,
  ErrorPayload,
  GetInvitationsData,
  GetInvitationsVariables,
  Invitation,
  InvitationsViewState,
} from './InvitationsView.types';

const getInvitationsQuery = gql`
  query getInvitations($page: Int!, $rowsPerPage: Int!) {
    viewer {
      invitations(page: $page, rowsPerPage: $rowsPerPage) {
        edges {
          node {
            id
            organization {
              identifier
              name
            }
          }
        }
        pageInfo {
          count
        }
      }
    }
  }
`;

const acceptInvitationMutation = gql`
  mutation acceptInvitation($input: AcceptInvitationInput!) {
    acceptInvitation(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

const declineInvitationMutation = gql`
  mutation declineInvitation($input: DeclineInvitationInput!) {
    declineInvitation(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const InvitationsView = () => {
  const [state, setState] = useState<InvitationsViewState>({
    viewer: null,
    page: 0,
    rowsPerPage: 20,
    message: null,
  });

  const variables: GetInvitationsVariables = { page: state.page, rowsPerPage: state.rowsPerPage };
  const { loading, data, error, refetch } = useQuery<GetInvitationsData, GetInvitationsVariables>(getInvitationsQuery, {
    variables,
  });
  useEffect(() => {
    if (!loading) {
      if (data) {
        const { viewer } = data;
        setState((prevState) => ({ ...prevState, viewer }));
      }
      setState((prevState) => ({ ...prevState, message: error?.message ?? null }));
    }
  }, [loading, data, error]);

  const [
    acceptInvitation,
    { loading: acceptInvitationLoading, data: acceptInvitationData, error: acceptInvitationError },
  ] = useMutation<AcceptInvitationData, AcceptInvitationVariables>(acceptInvitationMutation);
  useEffect(() => {
    if (!acceptInvitationLoading) {
      if (acceptInvitationData) {
        if (acceptInvitationData.acceptInvitation.__typename === 'SuccessPayload') {
          refetch(variables);
        } else if (acceptInvitationData.acceptInvitation.__typename === 'ErrorPayload') {
          const { message } = acceptInvitationData.acceptInvitation as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: message }));
        }
      }
      if (acceptInvitationError) {
        setState((prevState) => ({ ...prevState, message: acceptInvitationError.message }));
      }
    }
  }, [acceptInvitationLoading, acceptInvitationData, acceptInvitationError]);

  const handleAcceptInvitation = (invitation: Invitation) => {
    const variables: AcceptInvitationVariables = {
      input: {
        id: crypto.randomUUID(),
        organizationIdentifier: invitation.organization.identifier,
        invitationId: invitation.id,
      },
    };

    acceptInvitation({ variables });
  };

  const [
    declineInvitation,
    { loading: declineInvitationLoading, data: declineInvitationData, error: declineInvitationError },
  ] = useMutation<DeclineInvitationData, DeclineInvitationVariables>(declineInvitationMutation);
  useEffect(() => {
    if (!declineInvitationLoading) {
      if (declineInvitationData) {
        if (declineInvitationData.declineInvitation.__typename === 'SuccessPayload') {
          refetch(variables);
        } else if (declineInvitationData.declineInvitation.__typename === 'ErrorPayload') {
          const { message } = declineInvitationData.declineInvitation as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: message }));
        }
      }
      if (declineInvitationError) {
        setState((prevState) => ({ ...prevState, message: declineInvitationError.message }));
      }
    }
  }, [declineInvitationLoading, declineInvitationData, declineInvitationError]);

  const handleDeclineInvitation = (invitation: Invitation) => {
    const variables: DeclineInvitationVariables = {
      input: {
        id: crypto.randomUUID(),
        organizationIdentifier: invitation.organization.identifier,
        invitationId: invitation.id,
      },
    };

    declineInvitation({ variables });
  };

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const hasInvitations = !!data?.viewer && (data?.viewer?.invitations.edges ?? []).length > 0;
  const invitations = state.viewer?.invitations.edges.map((edge) => edge.node) ?? [];
  return (
    <>
      <div>
        <Navbar />
        <Container maxWidth="lg">
          <Toolbar />
          <Typography variant="h4" gutterBottom>
            Invitations
          </Typography>
          {state.viewer && hasInvitations ? (
            <Paper>
              <List>
                {invitations.map((invitation) => {
                  return (
                    <ListItem key={invitation.id}>
                      <ListItemText primary={invitation.organization.name} />
                      <Tooltip title="Accept invitation">
                        <Button
                          variant="outlined"
                          sx={{ padding: '5px', minWidth: '15px' }}
                          onClick={() => handleAcceptInvitation(invitation)}
                        >
                          <CheckIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Decline invitation">
                        <Button
                          variant="outlined"
                          sx={{ padding: '5px', minWidth: '15px', marginLeft: (theme) => theme.spacing(2) }}
                          onClick={() => handleDeclineInvitation(invitation)}
                        >
                          <ClearIcon />
                        </Button>
                      </Tooltip>
                    </ListItem>
                  );
                })}
              </List>
              <TablePagination
                component="div"
                count={state.viewer.invitations.pageInfo.count}
                page={state.page}
                onPageChange={handlePageChange}
                rowsPerPage={state.rowsPerPage}
                rowsPerPageOptions={[state.rowsPerPage]}
              />
            </Paper>
          ) : (
            <Box sx={{ paddingY: (theme) => theme.spacing(12) }}>
              <Typography variant="h6" align="center">
                No invitations found
              </Typography>
            </Box>
          )}
        </Container>
      </div>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
