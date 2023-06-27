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

import { gql, useQuery } from '@apollo/client';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, matchPath, useLocation, useParams } from 'react-router-dom';
import { Navbar } from '../../navbars/Navbar';
import { goToDomains, goToHome, goToNewOrganization } from '../../palette/DefaultPaletteActions';
import { PaletteNavigationAction } from '../../palette/Palette.types';
import { PaletteContext } from '../../palette/PaletteContext';
import { PaletteContextValue } from '../../palette/PaletteContext.types';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import { NotFoundView } from '../notfound/NotFoundView';
import { ProjectDrawer } from './ProjectDrawer';
import { ProjectViewPanel } from './ProjectDrawer.types';
import { GetProjectData, GetProjectVariables, ProjectViewState } from './ProjectView.types';
import { ProjectActivity } from './activity/ProjectActivity';
import { ProjectChangeProposal } from './changeproposals/ProjectChangeProposal';
import { ProjectHome } from './home/ProjectHome';
import { ProjectSettings } from './settings/ProjectSettings';
import { ProjectTags } from './tags/ProjectTags';

const getProjectQuery = gql`
  query getProject($identifier: ID!) {
    viewer {
      project(identifier: $identifier) {
        identifier
        name
        description
        organization {
          identifier
          name
          role
        }
      }
    }
  }
`;

export const ProjectView = () => {
  const location = useLocation();
  const activityMatch = matchPath('/projects/:projectId/activity', location.pathname);
  const changeProposalsMatch = matchPath('/projects/:projectId/changeproposals', location.pathname);
  const tagsMatch = matchPath('/projects/:projectId/tags', location.pathname);
  const settingsMatch = matchPath('/projects/:projectId/settings', location.pathname);

  let panel: ProjectViewPanel = 'Home';
  if (activityMatch) {
    panel = 'Activity';
  } else if (changeProposalsMatch) {
    panel = 'ChangeProposals';
  } else if (tagsMatch) {
    panel = 'Tags';
  } else if (settingsMatch) {
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

  const { projectIdentifier } = useParams();
  const variables: GetProjectVariables = { identifier: projectIdentifier ?? '' };
  const { loading, data, error } = useQuery<GetProjectData, GetProjectVariables>(getProjectQuery, { variables });

  const { setActions }: PaletteContextValue = useContext<PaletteContextValue>(PaletteContext);

  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { project },
        } = data;
        if (project) {
          setState((prevState) => ({ ...prevState, project }));

          const goToOrganization: PaletteNavigationAction = {
            type: 'navigation-action',
            id: 'go-to-organization',
            icon: <CorporateFareIcon fontSize="small" />,
            label: project.organization.name,
            to: `/orgs/${project.organization.identifier}`,
          };
          setActions([goToHome, goToDomains, goToOrganization]);
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }

    return () => setActions([goToHome, goToDomains, goToNewOrganization]);
  }, [loading, data, error]);

  useEffect(() => {}, []);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (!loading && state.project === null) {
    return <NotFoundView />;
  }

  let panelElement = null;
  if (state.project) {
    if (state.panel === 'Home') {
      panelElement = (
        <ProjectHome projectIdentifier={state.project.identifier} role={state.project.organization.role} />
      );
    } else if (state.panel === 'Activity') {
      panelElement = <ProjectActivity projectIdentifier={state.project.identifier} />;
    } else if (state.panel === 'ChangeProposals') {
      panelElement = (
        <ProjectChangeProposal projectIdentifier={state.project.identifier} role={state.project.organization.role} />
      );
    } else if (state.panel === 'Tags') {
      panelElement = (
        <ProjectTags projectIdentifier={state.project.identifier} role={state.project.organization.role} />
      );
    } else if (state.panel === 'Settings') {
      panelElement = (
        <ProjectSettings projectIdentifier={state.project.identifier} role={state.project.organization.role} />
      );
    }
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar>
          <Link component={RouterLink} to="/domains" color="inherit" underline="hover" fontWeight={800}>
            Domains
          </Link>
        </Navbar>
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
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
