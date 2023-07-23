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
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Navbar } from '../navbars/Navbar';
import { NotFoundView } from '../notfound/NotFoundView';
import { goToDomains, goToHelp, goToHome, goToNotifications, goToSettings } from '../palette/DefaultPaletteActions';
import { PaletteNavigationAction } from '../palette/Palette.types';
import { usePalette } from '../palette/usePalette';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import { ProjectDrawer } from './ProjectDrawer';
import { GetProjectData, GetProjectVariables, ProjectShellProps, ProjectShellState } from './ProjectShell.types';
import { ProjectContext } from './useProject';

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

export const ProjectShell = ({ children }: ProjectShellProps) => {
  const [state, setState] = useState<ProjectShellState>({
    errorSnackbarOpen: false,
  });

  const { projectIdentifier } = useParams();
  const variables: GetProjectVariables = { identifier: projectIdentifier ?? '' };
  const { data, error } = useQuery<GetProjectData, GetProjectVariables>(getProjectQuery, { variables });

  const { setActions } = usePalette();

  useEffect(() => {
    if (data) {
      const {
        viewer: { project },
      } = data;
      if (project) {
        setState((prevState) => ({ ...prevState, project }));

        const backToOrganization: PaletteNavigationAction = {
          type: 'navigation-action',
          id: 'go-to-organization',
          icon: <CorporateFareIcon fontSize="small" />,
          label: project.organization.name,
          to: `/orgs/${project.organization.identifier}`,
        };
        setActions([goToHome, backToOrganization, goToDomains, goToNotifications, goToSettings, goToHelp]);
      }
    }
    setState((prevState) => ({ ...prevState, errorSnackbarOpen: !!error }));
  }, [data, error]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (!data) {
    return null;
  }

  if (!data.viewer.project) {
    return <NotFoundView />;
  }

  return (
    <>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar>
          <Link component={RouterLink} to="/domains" color="inherit" underline="hover" fontWeight={800}>
            Domains
          </Link>
        </Navbar>
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: '1fr',
            gridTemplateColumns: 'min-content 1fr',
            flexGrow: '1',
          }}
        >
          <ProjectContext.Provider value={{ project: data.viewer.project }}>
            <ProjectDrawer />
            {children}
          </ProjectContext.Provider>
        </Box>
      </Box>
      <ErrorSnackbar open={state.errorSnackbarOpen} message={error?.message ?? null} onClose={handleCloseSnackbar} />
    </>
  );
};
