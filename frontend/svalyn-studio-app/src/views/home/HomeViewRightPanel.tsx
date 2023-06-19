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

import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { HomeViewRightPanelProps } from './HomeViewRightPanel.types';

export const HomeViewRightPanel = ({}: HomeViewRightPanelProps) => {
  return (
    <>
      <Paper
        elevation={0}
        square
        sx={{
          display: 'flex',
          flexDirection: 'column',
          paddingX: (theme) => theme.spacing(2),
          paddingY: (theme) => theme.spacing(1),
          borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" gutterBottom>
          News
        </Typography>
        <Link
          component={RouterLink}
          variant="body1"
          to="https://github.com/svalyn/svalyn-studio/releases/tag/v2023.5.0"
          target="_blank"
        >
          Release v2023.5.0
        </Link>
        <Link
          component={RouterLink}
          variant="body1"
          to="https://github.com/svalyn/svalyn-studio/releases/tag/v2023.3.0"
          target="_blank"
        >
          Release v2023.3.0
        </Link>
        <Link
          component={RouterLink}
          variant="body1"
          to="https://github.com/svalyn/svalyn-studio/releases/tag/v2023.1.0"
          target="_blank"
        >
          Release v2023.1.0
        </Link>
        <Link
          component={RouterLink}
          variant="body1"
          to="https://github.com/svalyn/svalyn-studio/releases/tag/v2022.11.0"
          target="_blank"
        >
          Release v2022.11.0
        </Link>
      </Paper>
    </>
  );
};
