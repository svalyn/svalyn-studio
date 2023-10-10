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
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NotFoundView } from '../notfound/NotFoundView';
import { goToDomains, goToHelp, goToHome, goToNotifications, goToSettings } from '../palette/DefaultPaletteActions';
import { PaletteNavigationAction } from '../palette/Palette.types';
import { usePalette } from '../palette/usePalette';
import { GetProjectData, GetProjectVariables, ProjectProviderProps } from './ProjectProvider.types';
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

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const { projectIdentifier } = useParams();

  const { enqueueSnackbar } = useSnackbar();
  const { setActions } = usePalette();

  const variables: GetProjectVariables = { identifier: projectIdentifier ?? '' };
  const { data, error } = useQuery<GetProjectData, GetProjectVariables>(getProjectQuery, { variables });

  useEffect(() => {
    if (data) {
      const {
        viewer: { project },
      } = data;
      if (project) {
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
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [data, error]);

  if (!data) {
    return null;
  }
  if (!data.viewer.project) {
    return <NotFoundView />;
  }

  return <ProjectContext.Provider value={{ project: data.viewer.project }}>{children}</ProjectContext.Provider>;
};
