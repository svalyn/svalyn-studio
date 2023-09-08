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

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { CreatedOn } from '../../../widgets/CreatedOn';
import { LastModifiedOn } from '../../../widgets/LastModifiedOn';
import { ChangeProposalHeaderProps } from './ChangeProposalHeader.types';

export const ChangeProposalHeader = ({ changeProposal }: ChangeProposalHeaderProps) => {
  let chip = <Chip icon={<PanoramaFishEyeIcon />} label="Open" size="small" variant="outlined" color="primary" />;
  if (changeProposal.status === 'CLOSED') {
    chip = <Chip icon={<NotInterestedIcon />} label="Closed" size="small" variant="outlined" color="error" />;
  } else if (changeProposal.status === 'INTEGRATED') {
    chip = (
      <Chip icon={<CheckCircleOutlineIcon />} label="Integrated" size="small" variant="outlined" color="success" />
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(2) }}>
      {chip}

      <CreatedOn date={new Date(changeProposal.createdOn)} profile={changeProposal.createdBy} />
      <LastModifiedOn date={new Date(changeProposal.lastModifiedOn)} profile={changeProposal.lastModifiedBy} />
    </Box>
  );
};
