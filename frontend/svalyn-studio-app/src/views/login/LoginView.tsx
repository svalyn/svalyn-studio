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

import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UnauthenticatedNavbar } from '../../navbars/UnauthenticatedNavbar';
import { LoginViewState, LoginViewTab } from './LoginView.types';
import { LoginWithCredentials } from './LoginWithCredentials';
import { LoginWithGithub } from './LoginWithGithub';

const a11yProps = (index: number) => {
  return {
    id: `login-strategy-tab-${index}`,
    'aria-controls': `login-strategy-tabpanel-${index}`,
  };
};

export const LoginView = () => {
  const [state, setState] = useState<LoginViewState>({
    tab: 'LOGIN_WITH_GITHUB',
  });

  const handleTabChange = (_: React.SyntheticEvent<Element, Event>, value: LoginViewTab) => {
    setState((prevState) => ({ ...prevState, tab: value }));
  };

  return (
    <div>
      <UnauthenticatedNavbar />
      <Container maxWidth="lg">
        <Toolbar />
        <Grid container spacing={6}>
          <Grid item xs={5}>
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: (theme) => theme.spacing(3),
                py: (theme) => theme.spacing(2),
                paddingRight: (theme) => theme.spacing(2),
              }}
            >
              <Tabs
                orientation="vertical"
                value={state.tab}
                onChange={handleTabChange}
                aria-label="login strategy tabs"
              >
                <Tab icon={<GitHubIcon />} {...a11yProps(0)} value="LOGIN_WITH_GITHUB" />
                <Tab icon={<EmailIcon />} {...a11yProps(1)} value="LOGIN_WITH_CREDENTIALS" />
              </Tabs>
              <Box sx={{ flex: '1' }}>
                {state.tab === 'LOGIN_WITH_GITHUB' ? <LoginWithGithub /> : <LoginWithCredentials />}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={7}>
            <Paper variant="outlined" sx={{ padding: (theme) => theme.spacing(2) }}>
              <Typography variant="h6">Get started</Typography>
              <Typography variant="h4">Collaborate on your domain with Svalyn</Typography>
              <Typography variant="body1" marginBottom="1em">
                Manage the complexity of your domain with Svalyn to build your tools.
              </Typography>
              <Button variant="outlined" startIcon={<HelpOutlineIcon />} component={Link} to="/help">
                Learn more
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};
