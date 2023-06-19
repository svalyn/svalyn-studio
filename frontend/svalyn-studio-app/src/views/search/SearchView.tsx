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
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import {
  GetSearchResultsData,
  GetSearchResultsVariables,
  OrganizationSearchResultsProps,
  ProjectSearchResultsProps,
  SearchViewState,
} from './SearchView.types';

const getSearchResultsQuery = gql`
  query getSearchResults($query: String!) {
    viewer {
      search(query: $query) {
        organizations {
          identifier
          name
        }
        projects {
          identifier
          name
          description
        }
      }
    }
  }
`;

export const SearchView = () => {
  const [state, setState] = useState<SearchViewState>({
    query: null,
    currentQuery: '',
    message: null,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const query = new URLSearchParams(searchParams).get('q');
    if (query) {
      setState((prevState) => ({ ...prevState, query, currentQuery: query }));
    }
  }, [searchParams]);

  const variables: GetSearchResultsVariables = {
    query: state.query || '',
  };
  const { data, error } = useQuery<GetSearchResultsData, GetSearchResultsVariables>(getSearchResultsQuery, {
    variables,
    skip: state.query === null,
  });

  const handleCurrentQueryChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, currentQuery: value }));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      setSearchParams(`?${new URLSearchParams({ q: state.currentQuery })}`);
    }
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <div>
        <Navbar />
        <Container maxWidth="lg">
          <Toolbar />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(10) }}>
            <Paper variant="outlined" sx={{ paddingX: (theme) => theme.spacing(2) }}>
              <FormControl variant="standard" fullWidth>
                <Input
                  value={state.currentQuery}
                  onChange={handleCurrentQueryChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  disableUnderline
                  autoFocus
                  fullWidth
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon fontSize="large" />
                    </InputAdornment>
                  }
                  inputProps={{
                    style: {
                      fontSize: '2rem',
                    },
                  }}
                />
              </FormControl>
            </Paper>
            {state.query && data ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(4) }}>
                <Typography variant="h4">Search results for "{state.query}"</Typography>
                <OrganizationSearchResults organizations={data.viewer.search.organizations} />
                <ProjectSearchResults projects={data.viewer.search.projects} />
              </Box>
            ) : null}
          </Box>
        </Container>
      </div>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};

const OrganizationSearchResults = ({ organizations }: OrganizationSearchResultsProps) => {
  if (organizations.length === 0) {
    return (
      <Box>
        <Typography>No organization found matching the query</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
      <Typography variant="h5">Organizations</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: (theme) => theme.spacing(2) }}>
        {organizations.map((organization) => (
          <Card key={organization.identifier}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {organization.name}
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} to={`/orgs/${organization.identifier}`}>
                View
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

const ProjectSearchResults = ({ projects }: ProjectSearchResultsProps) => {
  if (projects.length === 0) {
    return (
      <Box>
        <Typography>No project found matching the query</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
      <Typography variant="h5">Projects</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: (theme) => theme.spacing(2) }}>
        {projects.map((project) => (
          <Card key={project.identifier}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {project.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} to={`/projects/${project.identifier}`}>
                View
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
