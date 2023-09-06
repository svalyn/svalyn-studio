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

import { gql, useQuery } from '@apollo/client';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AccountRowProps, AccountTableState, GetAccountsData, GetAccountsVariables } from './AdminAccountsView.types';

const getAccountsQuery = gql`
  query getAccounts($page: Int!, $rowsPerPage: Int!) {
    viewer {
      asAdmin {
        accounts(page: $page, rowsPerPage: $rowsPerPage) {
          edges {
            node {
              username
              name
              email
              imageUrl
              role
              createdOn
              lastModifiedOn
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

export const AdminAccountsView = () => {
  return (
    <Box sx={{ paddingY: (theme) => theme.spacing(4) }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
          <Typography variant="h5">Accounts</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: (theme) => theme.spacing(2),
              }}
            >
              <Button variant="outlined" startIcon={<PersonIcon />} component={RouterLink} to="/admin/new/account">
                New Account
              </Button>
            </Box>
            <AccountTable />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const AccountTable = () => {
  const [state, setState] = useState<AccountTableState>({
    page: 0,
    rowsPerPage: 20,
  });

  const variables: GetAccountsVariables = {
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { data, error } = useQuery<GetAccountsData, GetAccountsVariables>(getAccountsQuery, { variables });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  if (!data) {
    return null;
  }
  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Last Modified On</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.viewer.asAdmin.accounts.edges
              .map((edge) => edge.node)
              .map((account) => (
                <AccountRow account={account} key={account.username} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        sx={{ borderBottom: 'none' }}
        component="div"
        onPageChange={handlePageChange}
        rowsPerPageOptions={[20]}
        rowsPerPage={20}
        page={state.page}
        count={data.viewer.asAdmin.accounts.pageInfo.count}
      />
    </>
  );
};

const AccountRow = ({ account }: AccountRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <Avatar alt={account.name} src={account.imageUrl} sx={{ width: 24, height: 24 }} />
      </TableCell>
      <TableCell>{account.username}</TableCell>
      <TableCell>{account.name}</TableCell>
      <TableCell>{account.email}</TableCell>
      <TableCell>{account.role.toLowerCase()}</TableCell>
      <TableCell>2023/03/02</TableCell>
      <TableCell>2023/05/17</TableCell>
    </TableRow>
  );
};
