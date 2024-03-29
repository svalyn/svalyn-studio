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

import ClearIcon from '@mui/icons-material/Clear';
import DifferenceIcon from '@mui/icons-material/Difference';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useProject } from '../useProject';
import { ChangeProposalsTableToolbarProps } from './ChangeProposalsTableToolbar.types';

export const ChangeProposalsTableToolbar = ({
  selectedChangeProposalsCount,
  onDelete,
  role,
}: ChangeProposalsTableToolbarProps) => {
  const { identifier: projectIdentifier } = useProject();
  return (
    <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h5">Change Proposals</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: (theme) => theme.spacing(1) }}>
        {selectedChangeProposalsCount > 0 ? (
          <Tooltip title="Delete change proposal(s)">
            <Button
              variant="outlined"
              sx={{ padding: '5px', minWidth: '15px' }}
              onClick={onDelete}
              disabled={role !== 'ADMIN'}
            >
              <ClearIcon />
            </Button>
          </Tooltip>
        ) : null}
        <Button
          variant="outlined"
          sx={{ marginLeft: 'auto' }}
          size="small"
          component={RouterLink}
          disabled={role === 'NONE'}
          startIcon={<DifferenceIcon />}
          to={`/projects/${projectIdentifier}/new/changeproposal`}
        >
          New Change Proposal
        </Button>
      </Box>
    </Toolbar>
  );
};
