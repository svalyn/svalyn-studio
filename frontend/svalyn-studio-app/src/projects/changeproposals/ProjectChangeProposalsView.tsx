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
import DifferenceIcon from '@mui/icons-material/Difference';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ProjectViewHeader } from '../ProjectViewHeader';
import { useProject } from '../useProject';
import { ChangeProposalsTableHead } from './ChangeProposalsTableHead';
import { ChangeProposalsTableToolbar } from './ChangeProposalsTableToolbar';
import {
  ChangeProposal,
  ChangeProposalStatusFilter,
  DeleteChangeProposalsData,
  DeleteChangeProposalsVariables,
  ErrorPayload,
  GetChangeProposalsData,
  GetChangeProposalsVariables,
  ProjectChangeProposalsViewState,
} from './ProjectChangeProposalsView.types';

const getChangeProposalsQuery = gql`
  query getChangeProposals($identifier: ID!, $status: [ChangeProposalStatus!]!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      project(identifier: $identifier) {
        changeProposals(status: $status, page: $page, rowsPerPage: $rowsPerPage) {
          edges {
            node {
              id
              name
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

const deleteChangeProposalsMutation = gql`
  mutation deleteChangeProposals($input: DeleteChangeProposalsInput!) {
    deleteChangeProposals(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const ProjectChangeProposalsView = () => {
  const {
    identifier: projectIdentifier,
    organization: { role },
  } = useProject();
  const [state, setState] = useState<ProjectChangeProposalsViewState>({
    project: null,
    selectedChangeProposalIds: [],
    filter: 'OPEN',
    page: 0,
    rowsPerPage: 10,
  });

  const { enqueueSnackbar } = useSnackbar();

  const variables: GetChangeProposalsVariables = {
    identifier: projectIdentifier,
    status: state.filter === 'OPEN' ? ['OPEN'] : ['INTEGRATED', 'CLOSED'],
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { loading, data, error, refetch } = useQuery<GetChangeProposalsData, GetChangeProposalsVariables>(
    getChangeProposalsQuery,
    { variables }
  );
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { project },
        } = data;
        if (project) {
          setState((prevState) => ({ ...prevState, project, selectedChangeProposalIds: [] }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, selectedChangeProposalIds: [] }));
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  }, [loading, data, error]);

  const [
    deleteChangeProposals,
    { loading: deleteChangeProposalsLoading, data: deleteChangeProposalsData, error: deleteChangeProposalsError },
  ] = useMutation<DeleteChangeProposalsData, DeleteChangeProposalsVariables>(deleteChangeProposalsMutation);
  useEffect(() => {
    if (!deleteChangeProposalsLoading) {
      if (deleteChangeProposalsData) {
        const { deleteChangeProposals } = deleteChangeProposalsData;
        if (deleteChangeProposals.__typename === 'SuccessPayload') {
          refetch(variables);
        } else if (deleteChangeProposals.__typename === 'ErrorPayload') {
          const errorPayload = deleteChangeProposals as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message }));
        }
      }
      if (deleteChangeProposalsError) {
        enqueueSnackbar(deleteChangeProposalsError.message, { variant: 'error' });
      }
    }
  }, [deleteChangeProposalsLoading, deleteChangeProposalsData, deleteChangeProposalsError]);

  const handleDelete = () => {
    const variables: DeleteChangeProposalsVariables = {
      input: {
        id: crypto.randomUUID(),
        changeProposalIds: state.selectedChangeProposalIds,
      },
    };
    deleteChangeProposals({ variables });
  };

  const selectAllChangeProposals = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setState((prevState) => {
        let selectedChangeProposalIds: string[] = prevState.selectedChangeProposalIds;
        if (prevState.project) {
          selectedChangeProposalIds = prevState.project.changeProposals.edges.map((edge) => edge.node.id);
        }
        return { ...prevState, selectedChangeProposalIds };
      });
    } else {
      setState((prevState) => ({ ...prevState, selectedChangeProposalIds: [] }));
    }
  };

  const selectChangeProposal = (
    _: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    changeProposal: ChangeProposal
  ) => {
    setState((prevState) => {
      const selectedChangeProposalIndex: number = prevState.selectedChangeProposalIds.indexOf(changeProposal.id);
      let selectedChangeProposalIds: string[] = [];

      if (selectedChangeProposalIndex === -1) {
        selectedChangeProposalIds = [...prevState.selectedChangeProposalIds, changeProposal.id];
      } else if (selectedChangeProposalIndex === 0) {
        selectedChangeProposalIds = [...prevState.selectedChangeProposalIds.slice(1)];
      } else if (selectedChangeProposalIndex === prevState.selectedChangeProposalIds.length - 1) {
        selectedChangeProposalIds = [...prevState.selectedChangeProposalIds.slice(0, -1)];
      } else if (selectedChangeProposalIndex > 0) {
        selectedChangeProposalIds = [
          ...prevState.selectedChangeProposalIds.slice(0, selectedChangeProposalIndex),
          ...prevState.selectedChangeProposalIds.slice(selectedChangeProposalIndex + 1),
        ];
      }

      return { ...prevState, selectedChangeProposalIds };
    });
  };

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
    setState((prevState) => ({ ...prevState, page }));
  };

  const handleFilterChange = (filter: ChangeProposalStatusFilter) =>
    setState((prevState) => ({ ...prevState, filter }));

  const changeProposals = state.project?.changeProposals.edges.map((edge) => edge.node) ?? [];
  return (
    <div>
      <ProjectViewHeader>
        <DifferenceIcon fontSize="medium" />
        <Typography variant="h5">Change proposals</Typography>
      </ProjectViewHeader>

      <Container maxWidth="lg" sx={{ py: (theme) => theme.spacing(4) }}>
        <ChangeProposalsTableToolbar
          onDelete={handleDelete}
          selectedChangeProposalsCount={state.selectedChangeProposalIds.length}
          role={role}
        />
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <ChangeProposalsTableHead
              filter={state.filter}
              onFilterChange={handleFilterChange}
              changeProposalsCount={changeProposals.length}
              selectedChangeProposalsCount={state.selectedChangeProposalIds.length}
              onSelectAll={selectAllChangeProposals}
            />
            <TableBody>
              {changeProposals.map((changeProposal) => {
                const isChangeProposalSelected = state.selectedChangeProposalIds.includes(changeProposal.id);
                return (
                  <TableRow key={changeProposal.id} onClick={(event) => selectChangeProposal(event, changeProposal)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isChangeProposalSelected} />
                    </TableCell>
                    <TableCell>
                      <Link
                        variant="subtitle1"
                        component={RouterLink}
                        to={`/projects/${projectIdentifier}/changeproposals/${changeProposal.id}`}
                        underline="hover"
                      >
                        {changeProposal.name}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {state.project && changeProposals.length > 0 ? (
          <TablePagination
            component="div"
            count={state.project.changeProposals.pageInfo.count}
            page={state.page}
            onPageChange={handlePageChange}
            rowsPerPage={state.rowsPerPage}
            rowsPerPageOptions={[state.rowsPerPage]}
          />
        ) : (
          <Box sx={{ paddingY: (theme) => theme.spacing(12) }}>
            <Typography variant="h6" align="center">
              No change proposals found
            </Typography>
          </Box>
        )}
      </Container>
    </div>
  );
};
