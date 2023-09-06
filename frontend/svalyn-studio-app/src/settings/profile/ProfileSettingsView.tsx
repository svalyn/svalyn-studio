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
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { GetAccountData, GetAccountVariables, ProfileSettingsViewState } from './ProfileSettingsView.types';

const getAccountQuery = gql`
  query getAccountQuery {
    viewer {
      username
    }
  }
`;

export const ProfileSettingsView = () => {
  const [state, setState] = useState<ProfileSettingsViewState>({ deleteAccountDialogOpen: false });

  const { enqueueSnackbar } = useSnackbar();

  const { data, error } = useQuery<GetAccountData, GetAccountVariables>(getAccountQuery);
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  const handleClick = () => {
    setState((prevState) => ({ ...prevState, deleteAccountDialogOpen: true }));
  };

  const handleClose = () => {
    setState((prevState) => ({ ...prevState, deleteAccountDialogOpen: false }));
  };

  if (!data) {
    return null;
  }

  return (
    <>
      <Box sx={{ paddingY: (theme) => theme.spacing(4) }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: (theme) => theme.spacing(2) }}>
            <Typography variant="h5">Profile</Typography>

            <Paper
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: (theme) => theme.spacing(1),
                padding: (theme) => theme.spacing(2),
              }}
            >
              <Typography variant="h6" color="error">
                Delete account
              </Typography>
              <Divider />
              <Typography sx={{ fontWeight: 600 }}>Be careful, deleting your account cannot be reversed</Typography>
              <Typography>
                If you decide to delete your account, all your personal information will be deleted along with all the
                data that your account owns. After that, your account will only be an empty anonymous account without
                any data. This empty anonymous account will still exist in order to stay attached to the contributions
                that you may have performed to some data owned by other users. For example, if you have renamed a
                project owned by another user and if it's the latest change performed on said project, then this
                anonymous account will be identified as the last person which has modified the project.
              </Typography>
              <Typography>
                You account may be the owner of multiple organizations. If you decide to move forward with the deletion
                of your account all those organisations will be deleted. This may end up deleting a sizeable amount of
                content so take some time to review the impact of such deletion.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button variant="outlined" color="error" onClick={handleClick}>
                  Delete Account
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
      <DeleteAccountDialog open={state.deleteAccountDialogOpen} username={data.viewer.username} onClose={handleClose} />
    </>
  );
};
