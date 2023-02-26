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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import {
  ExplorerProps,
  ExplorerState,
  GetChangeResourcesData,
  GetChangeResourcesVariables,
  Resource,
} from './Explorer.types';
import { ResourceTree } from './ResourceTree';

const getChangeResourcesQuery = gql`
  query getChangeResourcesQuery($changeId: ID!) {
    viewer {
      change(id: $changeId) {
        resources {
          edges {
            node {
              id
              path
              name
            }
          }
        }
      }
    }
  }
`;

export const Explorer = ({ changeId, onResourceClick }: ExplorerProps) => {
  const [state, setState] = useState<ExplorerState>({ message: null });
  const variables: GetChangeResourcesVariables = { changeId };
  const { data, error } = useQuery<GetChangeResourcesData, GetChangeResourcesVariables>(getChangeResourcesQuery, {
    variables,
  });
  useEffect(() => {
    if (error) {
      setState((prevState) => ({ ...prevState, message: error.message }));
    }
  }, [error]);

  const resources: Resource[] = (data?.viewer.change?.resources.edges ?? []).map((edge) => edge.node);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: (theme) => theme.spacing(2) }}>
        <Typography variant="t5">Explorer</Typography>
      </Box>
      <ResourceTree resources={resources} onResourceClick={onResourceClick} />
    </Box>
  );
};
