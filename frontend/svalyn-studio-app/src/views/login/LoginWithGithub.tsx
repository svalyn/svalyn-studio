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

import GitHubIcon from '@mui/icons-material/GitHub';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const { VITE_BACKEND_URL, VITE_FRONTEND_URL } = import.meta.env;

export const LoginWithGithub = () => {
  return (
    <Box>
      <Typography variant="h6">Login</Typography>
      <Typography variant="h4">Welcome to Svalyn!</Typography>
      <Typography variant="body1" marginBottom="1em">
        Let's begin working on your domain to build awesome tools.
      </Typography>
      <Button
        component="a"
        href={`${VITE_BACKEND_URL}/oauth2/authorization/github?redirect_uri=${VITE_FRONTEND_URL}/oauth2/redirect`}
        variant="contained"
        startIcon={<GitHubIcon />}
      >
        Login with Github
      </Button>
    </Box>
  );
};
