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
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { formatTime } from '../../utils/formatTime';
import {
  AuthenticationToken,
  AuthenticationTokenStatus,
  AuthenticationTokensSettingsTabProps,
  AuthenticationTokensSettingsTabState,
  ErrorPayload,
  GetAuthenticationTokensData,
  GetAuthenticationTokensVariables,
  UpdateAuthenticationTokensStatusData,
  UpdateAuthenticationTokensStatusVariables,
} from './AuthenticationTokensSettingsTab.types';
import { AuthenticationTokensTableHead } from './AuthenticationTokensTableHead';
import { AuthenticationTokensToolbar } from './AuthenticationTokensToolbar';
import { NewAuthenticationTokenDialog } from './NewAuthenticationTokenDialog';

const getAuthenticationTokensQuery = gql`
  query getAuthenticationTokens($page: Int!, $rowsPerPage: Int!) {
    viewer {
      authenticationTokens(page: $page, rowsPerPage: $rowsPerPage) {
        edges {
          node {
            id
            name
            status
            createdOn
          }
        }
        pageInfo {
          count
        }
      }
    }
  }
`;

const updateAuthenticationTokensStatusMutation = gql`
  mutation updateAuthenticationTokensStatus($input: UpdateAuthenticationTokensStatusInput!) {
    updateAuthenticationTokensStatus(input: $input) {
      __typename
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const AuthenticationTokensSettingsTab = ({}: AuthenticationTokensSettingsTabProps) => {
  const [state, setState] = useState<AuthenticationTokensSettingsTabState>({
    page: 0,
    rowsPerPage: 20,
    selectedAuthenticationTokenIds: [],
    newAuthenticationTokenDialogOpen: false,
  });

  const { enqueueSnackbar } = useSnackbar();

  const variables: GetAuthenticationTokensVariables = { page: state.page, rowsPerPage: state.rowsPerPage };
  const { data, error, refetch } = useQuery<GetAuthenticationTokensData, GetAuthenticationTokensVariables>(
    getAuthenticationTokensQuery,
    { variables }
  );
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  const openNewAuthenticationTokenDialog: React.MouseEventHandler<HTMLButtonElement> = () =>
    setState((prevState) => ({ ...prevState, newAuthenticationTokenDialogOpen: true }));
  const closeNewAuthenticationTokenDialog = () => {
    refetch(variables);
    setState((prevState) => ({ ...prevState, newAuthenticationTokenDialogOpen: false }));
  };

  const selectAllAuthenticationTokens = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setState((prevState) => {
        let selectedAuthenticationTokenIds: string[] = prevState.selectedAuthenticationTokenIds;
        if (data && data.viewer) {
          selectedAuthenticationTokenIds = data.viewer.authenticationTokens.edges.map((edge) => edge.node.id);
        }
        return { ...prevState, selectedAuthenticationTokenIds };
      });
    } else {
      setState((prevState) => ({ ...prevState, selectedAuthenticationTokenIds: [] }));
    }
  };

  const selectAuthenticationToken = (
    _: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    authenticationToken: AuthenticationToken
  ) => {
    setState((prevState) => {
      const selectedAuthenticationTokenIndex: number = prevState.selectedAuthenticationTokenIds.indexOf(
        authenticationToken.id
      );
      let selectedAuthenticationTokenIds: string[] = [];

      if (selectedAuthenticationTokenIndex === -1) {
        selectedAuthenticationTokenIds = [...prevState.selectedAuthenticationTokenIds, authenticationToken.id];
      } else if (selectedAuthenticationTokenIndex === 0) {
        selectedAuthenticationTokenIds = [...prevState.selectedAuthenticationTokenIds.slice(1)];
      } else if (selectedAuthenticationTokenIndex === prevState.selectedAuthenticationTokenIds.length - 1) {
        selectedAuthenticationTokenIds = [...prevState.selectedAuthenticationTokenIds.slice(0, -1)];
      } else if (selectedAuthenticationTokenIndex > 0) {
        selectedAuthenticationTokenIds = [
          ...prevState.selectedAuthenticationTokenIds.slice(0, selectedAuthenticationTokenIndex),
          ...prevState.selectedAuthenticationTokenIds.slice(selectedAuthenticationTokenIndex + 1),
        ];
      }

      return { ...prevState, selectedAuthenticationTokenIds };
    });
  };

  const [
    updateAuthenticationTokensStatus,
    { data: updateAuthenticationTokenStatusData, error: updateAuthenticationTokenStatusError },
  ] = useMutation<UpdateAuthenticationTokensStatusData, UpdateAuthenticationTokensStatusVariables>(
    updateAuthenticationTokensStatusMutation
  );
  useEffect(() => {
    if (updateAuthenticationTokenStatusData?.updateAuthenticationTokensStatus.__typename === 'ErrorPayload') {
      const errorPayload = updateAuthenticationTokenStatusData.updateAuthenticationTokensStatus as ErrorPayload;
      enqueueSnackbar(errorPayload.message, { variant: 'error' });
    } else if (updateAuthenticationTokenStatusData?.updateAuthenticationTokensStatus.__typename === 'SuccessPayload') {
      refetch(variables);
    }
    if (updateAuthenticationTokenStatusError) {
      enqueueSnackbar(updateAuthenticationTokenStatusError.message, { variant: 'error' });
    }
  }, [updateAuthenticationTokenStatusData, updateAuthenticationTokenStatusError]);

  const handleUpdateStatus = (status: AuthenticationTokenStatus) => {
    const variables: UpdateAuthenticationTokensStatusVariables = {
      input: {
        id: crypto.randomUUID(),
        authenticationTokenIds: state.selectedAuthenticationTokenIds,
        status,
      },
    };
    updateAuthenticationTokensStatus({ variables });
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Authentication tokens</Typography>
          <Button variant="outlined" endIcon={<AddIcon />} onClick={openNewAuthenticationTokenDialog}>
            New Authentication Token
          </Button>
        </Box>
        <div>
          {data && data.viewer && data.viewer.authenticationTokens.edges.length > 0 ? (
            <>
              <AuthenticationTokensToolbar
                selectedAuthenticationTokensCount={state.selectedAuthenticationTokenIds.length}
                onUpdateStatus={handleUpdateStatus}
              />
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <AuthenticationTokensTableHead
                    authenticationTokensCount={data.viewer.authenticationTokens.pageInfo.count}
                    selectedAuthenticationTokensCount={state.selectedAuthenticationTokenIds.length}
                    onSelectAll={selectAllAuthenticationTokens}
                  />
                  <TableBody>
                    {data.viewer.authenticationTokens.edges
                      .map((edge) => edge.node)
                      .map((authenticationToken) => {
                        const isAuthenticationTokenSelected = state.selectedAuthenticationTokenIds.includes(
                          authenticationToken.id
                        );
                        return (
                          <TableRow
                            key={authenticationToken.id}
                            onClick={(event) => selectAuthenticationToken(event, authenticationToken)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={isAuthenticationTokenSelected} />
                            </TableCell>
                            <TableCell>
                              <Typography>{authenticationToken.name}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{authenticationToken.status.toLowerCase()}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography>{formatTime(new Date(authenticationToken.createdOn))}</Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Box sx={{ paddingY: (theme) => theme.spacing(12) }}>
              <Typography variant="h6" align="center">
                No tokens found
              </Typography>
            </Box>
          )}
        </div>
      </Box>
      {state.newAuthenticationTokenDialogOpen ? (
        <NewAuthenticationTokenDialog
          open={state.newAuthenticationTokenDialogOpen}
          onClose={closeNewAuthenticationTokenDialog}
        />
      ) : null}
    </>
  );
};
