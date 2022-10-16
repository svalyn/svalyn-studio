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

import { gql, useLazyQuery } from '@apollo/client';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { matchPath, useLocation, useParams } from 'react-router-dom';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import { NotFoundView } from '../notfound/NotFoundView';
import { ProjectHome } from './home/ProjectHome';
import { ProjectDrawer } from './ProjectDrawer';
import { ProjectViewPanel } from './ProjectDrawer.types';
import { GetProjectData, GetProjectVariables, ProjectViewState } from './ProjectView.types';
import { ProjectSettings } from './settings/ProjectSettings';

const getProjectQuery = gql`
  query getProject($identifier: ID!) {
    viewer {
      project(identifier: $identifier) {
        identifier
        name
        description
      }
    }
  }
`;

export const ProjectView = () => {
  const location = useLocation();
  const settingsMatch = matchPath('/projects/:projectId/settings', location.pathname);

  let panel: ProjectViewPanel = 'Home';
  if (settingsMatch) {
    panel = 'Settings';
  }

  const [state, setState] = useState<ProjectViewState>({
    panel,
    project: null,
    message: null,
  });

  useEffect(() => {
    setState((prevState) => ({ ...prevState, panel }));
  }, [location]);

  const [getProject, { loading, data, error }] = useLazyQuery<GetProjectData, GetProjectVariables>(getProjectQuery);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { project },
        } = data;
        if (project) {
          setState((prevState) => ({ ...prevState, project }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const { projectIdentifier } = useParams();
  useEffect(() => {
    if (projectIdentifier) {
      const variables: GetProjectVariables = { identifier: projectIdentifier };
      getProject({ variables });
    }
  }, [projectIdentifier]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (!loading && state.project === null) {
    return <NotFoundView />;
  }

  let panelElement = null;
  if (projectIdentifier && state.panel === 'Home') {
    panelElement = <ProjectHome projectIdentifier={projectIdentifier} />;
  } else if (projectIdentifier && state.panel === 'Settings') {
    panelElement = <ProjectSettings projectIdentifier={projectIdentifier} />;
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        {state.project ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: '1fr',
              gridTemplateColumns: 'min-content 1fr',
              flexGrow: '1',
            }}
          >
            <ProjectDrawer projectIdentifier={state.project.identifier} selectedPanel={state.panel} />
            {panelElement}
          </Box>
        ) : null}
      </Box>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
