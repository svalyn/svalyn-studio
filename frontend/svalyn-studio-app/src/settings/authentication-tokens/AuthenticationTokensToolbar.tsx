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

import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { AuthenticationTokensToolbarProps } from './AuthenticationTokensToolbar.types';

export const AuthenticationTokensToolbar = ({
  selectedAuthenticationTokensCount,
  onUpdateStatus,
}: AuthenticationTokensToolbarProps) => {
  return (
    <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h5">Members</Typography>
      {selectedAuthenticationTokensCount > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: (theme) => theme.spacing(1) }}>
          <Tooltip title="Activate">
            <Button
              variant="outlined"
              sx={{ padding: '5px', minWidth: '15px' }}
              onClick={() => onUpdateStatus('ACTIVE')}
            >
              <PersonIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Deactivate">
            <Button
              variant="outlined"
              sx={{ padding: '5px', minWidth: '15px' }}
              onClick={() => onUpdateStatus('INACTIVE')}
            >
              <PersonOffIcon />
            </Button>
          </Tooltip>
        </Box>
      ) : null}
    </Toolbar>
  );
};
