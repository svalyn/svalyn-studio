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
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import { GetChangeResourceData, GetChangeResourceVariables, RawViewerProps, RawViewerState } from './RawViewer.types';

const { VITE_BACKEND_URL } = import.meta.env;

const getChangeResourceQuery = gql`
  query getChangeResourceQuery($changeId: ID!, $path: String!, $name: String!) {
    viewer {
      change(id: $changeId) {
        resource(path: $path, name: $name) {
          content
        }
      }
    }
  }
`;

export const RawViewer = ({ changeId, path, name }: RawViewerProps) => {
  const [state, setState] = useState<RawViewerState>({ message: null });

  const fullpath = path.length > 0 ? `${path}/${name}` : name;

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
      setState((prevState) => ({ ...prevState, message: error.message }));
    }
  }, [error]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <Paper
        id={fullpath}
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: (theme) => theme.spacing(2),
            py: '2px',
          }}
        >
          <Typography variant="subtitle1">{fullpath}</Typography>
          <div>
            <IconButton
              component="a"
              type="application/octet-stream"
              href={`${VITE_BACKEND_URL}/api/changes/${changeId}/resources/${path}/${name}`}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </div>
        </Box>
        <Divider />
        <Box sx={{ px: (theme) => theme.spacing(2), overflowX: 'scroll' }}>
          {data ? <pre>{data.viewer.change?.resource?.content}</pre> : null}
        </Box>
      </Paper>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
