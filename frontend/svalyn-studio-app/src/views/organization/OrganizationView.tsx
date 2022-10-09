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
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import { NotFoundView } from '../notfound/NotFoundView';
import { OrganizationPicker } from './OrganizationPicker';
import { GetOrganizationData, GetOrganizationVariables, OrganizationViewState } from './OrganizationView.types';
import { OrganizationViewTabPanel } from './OrganizationViewTabPanel';

const getOrganizationQuery = gql`
  query getOrganization($identifier: ID!) {
    viewer {
      organization(identifier: $identifier) {
        identifier
        name
      }
    }
  }
`;

export const OrganizationView = () => {
  const [state, setState] = useState<OrganizationViewState>({
    organization: null,
    message: null,
  });

  const [getOrganization, { loading, data, error }] = useLazyQuery<GetOrganizationData, GetOrganizationVariables>(
    getOrganizationQuery
  );
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { organization },
        } = data;
        if (organization) {
          setState((prevState) => ({ ...prevState, organization }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const { organizationIdentifier } = useParams();
  useEffect(() => {
    if (organizationIdentifier) {
      const variables: GetOrganizationVariables = { identifier: organizationIdentifier };
      getOrganization({ variables });
    }
  }, [organizationIdentifier]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  if (!loading && state.organization === null) {
    return <NotFoundView />;
  }

  return (
    <>
      <div>
        <Navbar>{state.organization ? <OrganizationPicker organization={state.organization} /> : null}</Navbar>
        {state.organization ? <OrganizationViewTabPanel organization={state.organization} /> : null}
      </div>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
