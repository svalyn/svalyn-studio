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

import { gql, useQuery } from '@apollo/client';
import ClassIcon from '@mui/icons-material/Class';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../../navbars/Navbar';
import { goToDomains, goToHelp, goToHome, goToNotifications, goToSettings } from '../../palette/DefaultPaletteActions';
import { PaletteNavigationAction } from '../../palette/Palette.types';
import { usePalette } from '../../palette/usePalette';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import { NotFoundView } from '../notfound/NotFoundView';
import { ChangeProposalViewState, GetChangeProposalData, GetChangeProposalVariables } from './ChangeProposalView.types';
import { ChangeProposalViewTabPanel } from './ChangeProposalViewTabPanel';

const getChangeProposalQuery = gql`
  query getChangeProposal($id: ID!) {
    viewer {
      changeProposal(id: $id) {
        id
        name
        project {
          identifier
          name
          organization {
            identifier
            name
            role
          }
        }
      }
    }
  }
`;

export const ChangeProposalView = () => {
  const { changeProposalId } = useParams();
  const [state, setState] = useState<ChangeProposalViewState>({ changeProposal: null, message: null });

  const variables: GetChangeProposalVariables = { id: changeProposalId ?? '' };
  const { loading, data, error } = useQuery<GetChangeProposalData, GetChangeProposalVariables>(getChangeProposalQuery, {
    variables,
  });

  const { setActions } = usePalette();

  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { changeProposal },
        } = data;
        if (changeProposal) {
          setState((prevState) => ({ ...prevState, changeProposal }));

          const backToProject: PaletteNavigationAction = {
            type: 'navigation-action',
            id: 'go-to-project',
            icon: <ClassIcon fontSize="small" />,
            label: changeProposal.project.name,
            to: `/projects/${changeProposal.project.identifier}`,
          };

          const backToOrganization: PaletteNavigationAction = {
            type: 'navigation-action',
            id: 'go-to-organization',
            icon: <CorporateFareIcon fontSize="small" />,
            label: changeProposal.project.organization.name,
            to: `/orgs/${changeProposal.project.organization.identifier}`,
          };
          setActions([
            goToHome,
            backToProject,
            backToOrganization,
            goToDomains,
            goToNotifications,
            goToSettings,
            goToHelp,
          ]);
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (!loading && state.changeProposal === null) {
    return <NotFoundView />;
  }

  return (
    <>
      <div>
        <Navbar />
        {state.changeProposal ? <ChangeProposalViewTabPanel changeProposal={state.changeProposal} /> : null}
      </div>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
