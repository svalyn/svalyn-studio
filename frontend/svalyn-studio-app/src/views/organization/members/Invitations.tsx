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
import ClearIcon from '@mui/icons-material/Clear';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  ErrorPayload,
  GetOrganizationInvitationsData,
  GetOrganizationInvitationsVariables,
  Invitation,
  InvitationsProps,
  InvitationsState,
  RevokeInvitationData,
  RevokeInvitationVariables,
} from './Invitations.types';

const getOrganizationInvitationsQuery = gql`
  query getOrganizationInvitations($identifier: ID!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      organization(identifier: $identifier) {
        invitations(page: $page, rowsPerPage: $rowsPerPage) {
          edges {
            node {
              id
              member {
                name
                imageUrl
              }
            }
          }
          pageInfo {
            count
          }
        }
      }
    }
  }
`;

const revokeInvitationMutation = gql`
  mutation revokeInvitation($input: RevokeInvitationInput!) {
    revokeInvitation(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const Invitations = ({ organizationIdentifier, role }: InvitationsProps) => {
  const [state, setState] = useState<InvitationsState>({
    organization: null,
    page: 0,
    rowsPerPage: 10,
    message: null,
  });

  const variables: GetOrganizationInvitationsVariables = {
    identifier: organizationIdentifier,
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { loading, data, error, refetch } = useQuery<
    GetOrganizationInvitationsData,
    GetOrganizationInvitationsVariables
  >(getOrganizationInvitationsQuery, { variables });
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { organization },
        } = data;
        if (organization) {
          setState((prevState) => ({ ...prevState, organization }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const [
    revokeInvitation,
    { loading: revokeInvitationLoading, data: revokeInvitationData, error: revokeInvitationError },
  ] = useMutation<RevokeInvitationData, RevokeInvitationVariables>(revokeInvitationMutation);
  useEffect(() => {
    if (!revokeInvitationLoading) {
      if (revokeInvitationData) {
        if (revokeInvitationData.revokeInvitation.__typename === 'SuccessPayload') {
          refetch(variables);
        } else if (revokeInvitationData.revokeInvitation.__typename === 'ErrorPayload') {
          const { message } = revokeInvitationData.revokeInvitation as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: message }));
        }
      }
      if (revokeInvitationError) {
        setState((prevState) => ({ ...prevState, message: revokeInvitationError.message }));
      }
    }
  }, [revokeInvitationLoading, revokeInvitationData, revokeInvitationError]);

  const handleRevokeInvitation = (invitation: Invitation) => {
    const variables: RevokeInvitationVariables = {
      input: {
        id: uuid(),
        organizationIdentifier,
        invitationId: invitation.id,
      },
    };

    revokeInvitation({ variables });
  };

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const hasInvitations = !!data?.viewer && (data?.viewer?.organization?.invitations.edges ?? []).length > 0;
  const invitations = state.organization?.invitations.edges.map((edge) => edge.node) ?? [];
  return (
    <>
      {state.organization && hasInvitations ? (
        <div>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableBody>
                {invitations.map((invitation) => {
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell width="5%">
                        <Avatar alt={invitation.member.name} src={invitation.member.imageUrl} />
                      </TableCell>
                      <TableCell width="90%">{invitation.member.name}</TableCell>
                      <TableCell width="5%">
                        <Tooltip title="Revoke invitation">
                          <Button
                            variant="outlined"
                            sx={{ padding: '5px', minWidth: '15px' }}
                            onClick={() => handleRevokeInvitation(invitation)}
                            disabled={role !== 'ADMIN'}
                          >
                            <ClearIcon />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={state.organization.invitations.pageInfo.count}
            page={state.page}
            onPageChange={handlePageChange}
            rowsPerPage={state.rowsPerPage}
            rowsPerPageOptions={[state.rowsPerPage]}
          />
        </div>
      ) : (
        <Box sx={{ paddingY: (theme) => theme.spacing(12) }}>
          <Typography variant="h6" align="center">
            No invitations found
          </Typography>
        </Box>
      )}
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
