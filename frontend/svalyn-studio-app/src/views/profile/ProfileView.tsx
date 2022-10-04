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
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import { GetViewerData, GetViewerVariables, ProfileViewState } from './ProfileView.types';

const getViewerQuery = gql`
  query getViewer {
    viewer {
      name
      imageUrl
    }
  }
`;

export const ProfileView = () => {
  const [state, setState] = useState<ProfileViewState>({
    viewer: null,
    message: null,
  });

  const { loading, data, error } = useQuery<GetViewerData, GetViewerVariables>(getViewerQuery);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const { viewer } = data;
        setState((prevState) => ({ ...prevState, viewer }));
      }
      setState((prevState) => ({ ...prevState, message: error?.message ?? null }));
    }
  }, [loading, data, error]);

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <div>
        <Navbar />
        <Container maxWidth="lg">
          <Toolbar />
          {state.viewer !== null ? (
            <Grid container spacing={2}>
              <Grid item container xs={4} justifyContent="center">
                <Avatar src={state.viewer.imageUrl} alt={state.viewer.name} sx={{ width: 200, height: 200 }} />
                <Typography variant="h6">{state.viewer.name}</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h4" gutterBottom>
                  Activity
                </Typography>
                <Typography variant="body1">No activity recorded for this profile yet</Typography>
              </Grid>
            </Grid>
          ) : null}
        </Container>
      </div>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
