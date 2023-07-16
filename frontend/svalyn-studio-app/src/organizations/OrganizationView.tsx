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
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Navbar } from '../navbars/Navbar';
import { NotFoundView } from '../notfound/NotFoundView';
import { ErrorSnackbar } from '../snackbar/ErrorSnackbar';
import { OrganizationPicker } from './OrganizationPicker';
import { GetOrganizationData, GetOrganizationVariables, OrganizationViewState } from './OrganizationView.types';
import { OrganizationViewTabPanel } from './OrganizationViewTabPanel';

const getOrganizationQuery = gql`
  query getOrganization($identifier: ID!) {
    viewer {
      organization(identifier: $identifier) {
        identifier
        name
        role
      }
    }
  }
`;

export const OrganizationView = () => {
  const [state, setState] = useState<OrganizationViewState>({
    errorSnackbarOpen: false,
  });

  const { organizationIdentifier } = useParams();
  const variables: GetOrganizationVariables = { identifier: organizationIdentifier ?? '' };
  const { data, error, refetch } = useQuery<GetOrganizationData, GetOrganizationVariables>(getOrganizationQuery, {
    variables,
  });
  useEffect(() => setState((prevState) => ({ ...prevState, errorSnackbarOpen: !!error })), [error]);

  const location = useLocation();
  useEffect(() => {
    if (data) {
      refetch(variables);
    }
  }, [location.pathname]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, errorSnackbarOpen: false }));

  if (data && !data.viewer.organization) {
    return <NotFoundView />;
  }

  return (
    <>
      <div>
        <Navbar>
          {data?.viewer.organization ? <OrganizationPicker organization={data.viewer.organization} /> : null}
        </Navbar>
        {data?.viewer.organization ? <OrganizationViewTabPanel organization={data.viewer.organization} /> : null}
      </div>
      <ErrorSnackbar open={state.errorSnackbarOpen} message={error?.message ?? null} onClose={handleCloseSnackbar} />
    </>
  );
};
