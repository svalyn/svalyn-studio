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
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { GraphViewer } from './GraphViewer';
import { GetChangeResourceData, GetChangeResourceVariables, ViewerProps } from './Viewer.types';

const getChangeResourceQuery = gql`
  query getChangeResourceQuery($changeId: ID!, $path: String!, $name: String!) {
    viewer {
      change(id: $changeId) {
        resource(path: $path, name: $name) {
          contentType
          content
        }
      }
    }
  }
`;

export const Viewer = ({ changeId, path, name }: ViewerProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const variables: GetChangeResourceVariables = {
    changeId,
    path,
    name,
  };
  const { data, error } = useQuery<GetChangeResourceData, GetChangeResourceVariables>(getChangeResourceQuery, {
    variables,
  });
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  let rawViewer: JSX.Element | null = null;
  if (data && data.viewer.change && data.viewer.change.resource) {
    const { resource } = data.viewer.change;

    if (resource.contentType === 'TEXT_PLAIN') {
      rawViewer = (
        <Box sx={{ px: (theme) => theme.spacing(2), overflow: 'scroll' }}>
          <pre>
            <Typography variant="tcontent">{resource.content}</Typography>
          </pre>
        </Box>
      );
    } else {
      rawViewer = <GraphViewer content={resource.content} />;
    }
  }
  return rawViewer;
};
