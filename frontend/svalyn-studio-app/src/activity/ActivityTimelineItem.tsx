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

import AddIcon from '@mui/icons-material/Add';
import ClassIcon from '@mui/icons-material/Class';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import MergeIcon from '@mui/icons-material/Merge';
import PersonIcon from '@mui/icons-material/Person';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { formatTime } from '../utils/formatTime';
import { ActivityTimelineItemProps } from './ActivityTimelineItem.types';

export const ActivityTimelineItem = ({ date, kind, createdBy, title, description }: ActivityTimelineItemProps) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const done = theme.palette.done[mode];

  let dot = (
    <TimelineDot color="primary" variant="outlined">
      <AddIcon color="primary" />
    </TimelineDot>
  );
  if (kind === 'ACCOUNT_CREATED') {
    dot = (
      <TimelineDot color="success" variant="outlined">
        <PersonIcon color="success" />
      </TimelineDot>
    );
  } else if (kind === 'ORGANIZATION_CREATED') {
    dot = (
      <TimelineDot color="success" variant="outlined">
        <CorporateFareIcon color="success" />
      </TimelineDot>
    );
  } else if (kind === 'PROJECT_CREATED') {
    dot = (
      <TimelineDot color="success" variant="outlined">
        <ClassIcon color="success" />
      </TimelineDot>
    );
  } else if (kind === 'PROJECT_DELETED') {
    dot = (
      <TimelineDot color="error" variant="outlined">
        <ClassIcon color="error" />
      </TimelineDot>
    );
  } else if (kind === 'CHANGE_PROPOSAL_CREATED') {
    dot = (
      <TimelineDot color="success" variant="outlined">
        <MergeIcon color="success" />
      </TimelineDot>
    );
  } else if (kind === 'CHANGE_PROPOSAL_REVIEWED') {
    dot = (
      <TimelineDot color="primary" variant="outlined">
        <MergeIcon color="primary" />
      </TimelineDot>
    );
  } else if (kind === 'CHANGE_PROPOSAL_INTEGRATED') {
    dot = (
      <TimelineDot sx={{ color: done, borderColor: done }} variant="outlined">
        <MergeIcon sx={{ color: done }} />
      </TimelineDot>
    );
  }

  return (
    <TimelineItem>
      <TimelineOppositeContent sx={{ m: 'auto 0px' }}>
        <Tooltip
          title={new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long' }).format(date)}
          placement="top"
        >
          <Typography variant="body2" color="text.secondary">
            {formatTime(date)}
          </Typography>
        </Tooltip>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector />
        {dot}
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: (theme) => theme.spacing(0.5),
          }}
        >
          <Tooltip title={createdBy.name}>
            <Avatar
              component={RouterLink}
              to={`/profile/${createdBy.username}`}
              alt={createdBy.name}
              src={createdBy.imageUrl}
              sx={{ width: 24, height: 24 }}
            />
          </Tooltip>
          <Link
            component={RouterLink}
            to={`/profile/${createdBy.username}`}
            color="inherit"
            underline="hover"
            sx={{ fontWeight: 'bold' }}
          >
            {createdBy.username}
          </Link>
          <Typography>{description}</Typography>
        </Box>
      </TimelineContent>
    </TimelineItem>
  );
};
