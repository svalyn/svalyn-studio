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
import TagIcon from '@mui/icons-material/Tag';
import Box from '@mui/material/Box';
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
import { ProjectViewHeader } from '../ProjectViewHeader';
import { useProject } from '../useProject';
import { NewTagCard } from './NewTagCard';
import { GetProjectTagsData, GetProjectTagsVariables, ProjectTagsViewState } from './ProjectTagsView.types';

const getProjectTagsQuery = gql`
  query getProjectTags($identifier: ID!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      project(identifier: $identifier) {
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

export const ProjectTagsView = () => {
  const { identifier: projectIdentifier } = useProject();
  const [state, setState] = useState<ProjectTagsViewState>({
    page: 0,
    rowsPerPage: 10,
  });

  const { enqueueSnackbar } = useSnackbar();

  const variables: GetProjectTagsVariables = {
    identifier: projectIdentifier,
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { data, error, refetch } = useQuery<GetProjectTagsData, GetProjectTagsVariables>(getProjectTagsQuery, {
    variables,
  });
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  const onPageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) =>
    setState((prevState) => ({ ...prevState, page }));

  return (
    <div>
      <ProjectViewHeader>
        <TagIcon fontSize="medium" />
        <Typography variant="h5">Tags</Typography>
      </ProjectViewHeader>
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: (theme) => theme.spacing(2),
          paddingTop: (theme) => theme.spacing(4),
        }}
      >
        <NewTagCard onTagCreated={() => refetch(variables)} />
        <Box>
          {data && data.viewer && data.viewer.project && data.viewer.project.tags.edges.length > 0 ? (
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
                    {data.viewer.project.tags.edges
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
                count={data.viewer.project.tags.pageInfo.count}
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
    </div>
  );
};
