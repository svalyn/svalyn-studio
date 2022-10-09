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
import { Navigate } from 'react-router-dom';
import { GetOrganizationsData, GetOrganizationsVariables, HomeViewState } from './HomeView.types';

const getOrganizationsQuery = gql`
  query getOrganizations {
    viewer {
      organizations {
        edges {
          node {
            identifier
          }
        }
      }
    }
  }
`;

export const HomeView = () => {
  const [state, setState] = useState<HomeViewState>({
    organizations: null,
  });

  const { loading, data } = useQuery<GetOrganizationsData, GetOrganizationsVariables>(getOrganizationsQuery);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { organizations },
        } = data;
        setState((prevState) => ({ ...prevState, organizations: organizations.edges.map((edge) => edge.node) }));
      }
    }
  }, [loading, data]);

  if (state.organizations) {
    if (state.organizations.length > 0) {
      const organization = state.organizations[0];
      return <Navigate to={`/orgs/${organization.identifier}`} />;
    } else {
      return <Navigate to="/new/organization" />;
    }
  }

  return null;
};
