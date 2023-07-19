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
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import { Domain, DomainsViewState, GetDomainsData, GetDomainsVariables } from './DomainsView.types';

const getDomainsQuery = gql`
  query getDomains($page: Int!, $rowsPerPage: Int!) {
    viewer {
      domains(page: $page, rowsPerPage: $rowsPerPage) {
        edges {
          node {
            identifier
            label
            version
          }
        }
        pageInfo {
          count
        }
      }
    }
  }
`;

export const DomainsView = () => {
  const [state, setState] = useState<DomainsViewState>({
    page: 0,
    rowsPerPage: 20,
    message: null,
  });

  const variables: GetDomainsVariables = {
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { data, error } = useQuery<GetDomainsData, GetDomainsVariables>(getDomainsQuery, { variables });
  useEffect(() => {
    setState((prevState) => ({ ...prevState, message: error?.message ?? null }));
  }, [error]);

  const domains: Domain[] = (data?.viewer.domains.edges ?? []).map((edge) => edge.node);
  const count: number = data?.viewer.domains.pageInfo.count ?? 0;

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Domains
      </Typography>
      {domains.length > 0 ? (
        <Paper>
          <List>
            {domains.map((domain) => {
              return (
                <ListItem key={domain.identifier}>
                  <ListItemButton component={RouterLink} to={`/domains/${domain.identifier}`}>
                    <ListItemText primary={`${domain.label}`} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <TablePagination
            component="div"
            count={count}
            page={state.page}
            onPageChange={handlePageChange}
            rowsPerPage={state.rowsPerPage}
            rowsPerPageOptions={[state.rowsPerPage]}
          />
        </Paper>
      ) : (
        <Box sx={{ paddingY: (theme) => theme.spacing(12) }}>
          <Typography variant="h6" align="center">
            No domains found
          </Typography>
        </Box>
      )}
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
