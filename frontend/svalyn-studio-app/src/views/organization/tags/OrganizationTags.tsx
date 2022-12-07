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
import AddIcon from '@mui/icons-material/Add';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  AddTagToOrganizationData,
  AddTagToOrganizationVariables,
  ErrorPayload,
  GetOrganizationTagsData,
  GetOrganizationTagsVariables,
  OrganizationTagsProps,
  OrganizationTagsState,
} from './OrganizationTags.types';

const getOrganizationTagsQuery = gql`
  query getOrganizationTags($identifier: ID!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      organization(identifier: $identifier) {
        tags(page: $page, rowsPerPage: $rowsPerPage) {
          edges {
            node {
              id
              key
              value
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

const addTagToOrganizationMutation = gql`
  mutation addTagToOrganization($input: AddTagToOrganizationInput!) {
    addTagToOrganization(input: $input) {
      __typename
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const OrganizationTags = ({ organizationIdentifier, role }: OrganizationTagsProps) => {
  const [state, setState] = useState<OrganizationTagsState>({
    key: '',
    value: '',
    page: 0,
    rowsPerPage: 10,
    message: null,
  });

  const variables: GetOrganizationTagsVariables = {
    identifier: organizationIdentifier,
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { data, error, refetch } = useQuery<GetOrganizationTagsData, GetOrganizationTagsVariables>(
    getOrganizationTagsQuery,
    {
      variables,
    }
  );
  useEffect(() => {
    if (error) {
      setState((prevState) => ({ ...prevState, message: error.message }));
    }
  }, [error]);

  const handleKeyChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, key: value }));
  };

  const handleValueChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, value }));
  };

  const [addTagToOrganization, { data: addTagToOrganizationData, error: addTagToOrganizationError }] = useMutation<
    AddTagToOrganizationData,
    AddTagToOrganizationVariables
  >(addTagToOrganizationMutation);
  useEffect(() => {
    if (addTagToOrganizationError) {
      setState((prevState) => ({ ...prevState, message: addTagToOrganizationError.message }));
    }
    if (addTagToOrganizationData) {
      if (addTagToOrganizationData.addTagToOrganization.__typename === 'ErrorPayload') {
        const errorPayload = addTagToOrganizationData.addTagToOrganization as ErrorPayload;
        setState((prevState) => ({ ...prevState, message: errorPayload.message }));
      } else if (addTagToOrganizationData.addTagToOrganization.__typename === 'SuccessPayload') {
        setState((prevState) => ({ ...prevState, key: '', value: '' }));
        refetch(variables);
      }
    }
  }, [addTagToOrganizationData, addTagToOrganizationError]);

  const handleAddTag: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: AddTagToOrganizationVariables = {
      input: {
        id: uuid(),
        organizationIdentifier,
        key: state.key,
        value: state.value,
      },
    };
    addTagToOrganization({ variables });
  };

  const onPageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) =>
    setState((prevState) => ({ ...prevState, page }));

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const isValidNewTag = state.key.trim().length > 0 && state.value.trim().length > 0;
  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: (theme) => theme.spacing(2),
          paddingTop: (theme) => theme.spacing(4),
        }}
      >
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: (theme) => theme.spacing(2),
            padding: (theme) => theme.spacing(3),
          }}
        >
          <Typography variant="h5">Tags</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: '1fr',
              gridTemplateColumns: '1fr 1fr min-content',
              gap: (theme) => theme.spacing(2),
            }}
          >
            <TextField
              label="Key"
              value={state.key}
              onChange={handleKeyChange}
              size="small"
              disabled={role === 'NONE'}
            />
            <TextField
              label="Value"
              value={state.value}
              onChange={handleValueChange}
              size="small"
              disabled={role === 'NONE'}
            />
            <Button
              variant="outlined"
              disabled={!isValidNewTag || role === 'NONE'}
              onClick={handleAddTag}
              sx={{ whiteSpace: 'nowrap' }}
              size="small"
              endIcon={<AddIcon />}
            >
              Add new tag
            </Button>
          </Box>
        </Paper>
        <Box>
          {data && data.viewer && data.viewer.organization && data.viewer.organization.tags.edges.length > 0 ? (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="50%">Key</TableCell>
                      <TableCell width="50%">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.viewer.organization.tags.edges
                      .map((edge) => edge.node)
                      .map((tag) => (
                        <TableRow key={tag.id}>
                          <TableCell>{tag.key}</TableCell>
                          <TableCell>{tag.value}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                sx={{ borderBottom: 'none' }}
                component="div"
                onPageChange={onPageChange}
                rowsPerPageOptions={[10]}
                rowsPerPage={10}
                page={state.page}
                count={data.viewer.organization.tags.pageInfo.count}
              />
            </>
          ) : (
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: (theme) => theme.spacing(15),
              }}
            >
              No tags added yet
            </Typography>
          )}
        </Box>
      </Container>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
