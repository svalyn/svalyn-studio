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
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  ErrorPayload,
  GetOrganizationMembershipsData,
  GetOrganizationMembershipsVariables,
  Membership,
  MembershipsProps,
  MembershipsState,
  RevokeMembershipsData,
  RevokeMembershipsVariables,
} from './Memberships.types';
import { MembershipsTableHead } from './MembershipsTableHead';
import { MembershipsTableToolbar } from './MembershipsTableToolbar';

const getOrganizationMembershipsQuery = gql`
  query getOrganizationMemberships($identifier: ID!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      organization(identifier: $identifier) {
        memberships(page: $page, rowsPerPage: $rowsPerPage) {
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

const revokeMembershipsMutation = gql`
  mutation revokeMemberships($input: RevokeMembershipsInput!) {
    revokeMemberships(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const Memberships = ({ organizationIdentifier, role }: MembershipsProps) => {
  const [state, setState] = useState<MembershipsState>({
    organization: null,
    selectedMembershipIds: [],
    page: 0,
    rowsPerPage: 10,
    message: null,
  });

  const variables: GetOrganizationMembershipsVariables = {
    identifier: organizationIdentifier,
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { loading, data, error, refetch } = useQuery<
    GetOrganizationMembershipsData,
    GetOrganizationMembershipsVariables
  >(getOrganizationMembershipsQuery, { variables });
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { organization },
        } = data;
        if (organization) {
          setState((prevState) => ({ ...prevState, organization, selectedMembershipIds: [] }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const [
    revokeMemberships,
    { loading: revokeMembershipsLoading, data: revokeMembershipsData, error: revokeMembershipsError },
  ] = useMutation<RevokeMembershipsData, RevokeMembershipsVariables>(revokeMembershipsMutation);
  useEffect(() => {
    if (!revokeMembershipsLoading) {
      if (revokeMembershipsData) {
        const { revokeMemberships } = revokeMembershipsData;
        if (revokeMemberships.__typename === 'SuccessPayload') {
          refetch(variables);
        } else if (revokeMemberships.__typename === 'ErrorPayload') {
          const errorPayload = revokeMemberships as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message }));
        }
      }
      if (revokeMembershipsError) {
        setState((prevState) => ({ ...prevState, message: revokeMembershipsError.message }));
      }
    }
  }, [revokeMembershipsLoading, revokeMembershipsData, revokeMembershipsError]);

  const handleRevoke = () => {
    const variables: RevokeMembershipsVariables = {
      input: {
        id: crypto.randomUUID(),
        organizationIdentifier,
        membershipIds: state.selectedMembershipIds,
      },
    };

    revokeMemberships({ variables });
  };

  const selectAllMemberships = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setState((prevState) => {
        let selectedMembershipIds: string[] = prevState.selectedMembershipIds;
        if (prevState.organization) {
          selectedMembershipIds = prevState.organization.memberships.edges.map((edge) => edge.node.id);
        }
        return { ...prevState, selectedMembershipIds };
      });
    } else {
      setState((prevState) => ({ ...prevState, selectedMembershipIds: [] }));
    }
  };

  const selectMembership = (_: React.MouseEvent<HTMLTableRowElement, MouseEvent>, membership: Membership) => {
    setState((prevState) => {
      const selectedMembershipIndex: number = prevState.selectedMembershipIds.indexOf(membership.id);
      let selectedMembershipIds: string[] = [];

      if (selectedMembershipIndex === -1) {
        selectedMembershipIds = [...prevState.selectedMembershipIds, membership.id];
      } else if (selectedMembershipIndex === 0) {
        selectedMembershipIds = [...prevState.selectedMembershipIds.slice(1)];
      } else if (selectedMembershipIndex === prevState.selectedMembershipIds.length - 1) {
        selectedMembershipIds = [...prevState.selectedMembershipIds.slice(0, -1)];
      } else if (selectedMembershipIndex > 0) {
        selectedMembershipIds = [
          ...prevState.selectedMembershipIds.slice(0, selectedMembershipIndex),
          ...prevState.selectedMembershipIds.slice(selectedMembershipIndex + 1),
        ];
      }

      return { ...prevState, selectedMembershipIds };
    });
  };

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const hasMemberships = !!data?.viewer && (data?.viewer?.organization?.memberships.edges ?? []).length > 0;
  const memberships = state.organization?.memberships.edges.map((edge) => edge.node) ?? [];
  return (
    <>
      {state.organization && hasMemberships ? (
        <>
          <MembershipsTableToolbar
            onRevoke={handleRevoke}
            selectedMembershipsCount={state.selectedMembershipIds.length}
            role={role}
          />
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <MembershipsTableHead
                membershipsCount={memberships.length}
                selectedMembershipsCount={state.selectedMembershipIds.length}
                onSelectAll={selectAllMemberships}
              />
              <TableBody>
                {memberships.map((membership) => {
                  const isMembershipSelected = state.selectedMembershipIds.includes(membership.id);
                  return (
                    <TableRow key={membership.id} onClick={(event) => selectMembership(event, membership)}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={isMembershipSelected} />
                      </TableCell>
                      <TableCell
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: (theme) => theme.spacing(2),
                          alignItems: 'center',
                        }}
                      >
                        <Avatar alt={membership.member.name} src={membership.member.imageUrl} />
                        {membership.member.name}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={state.organization.memberships.pageInfo.count}
            page={state.page}
            onPageChange={handlePageChange}
            rowsPerPage={state.rowsPerPage}
            rowsPerPageOptions={[state.rowsPerPage]}
          />
        </>
      ) : (
        <Box sx={{ paddingY: (theme) => theme.spacing(12) }}>
          <Typography variant="h6" align="center">
            No members found
          </Typography>
        </Box>
      )}
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
