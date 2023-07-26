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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { formatTime } from '../utils/formatTime';
import { GetProfileData, GetProfileVariables, ProfileHovercardProps } from './ProfileHovercard.types';

const getProfileQuery = gql`
  query getProfile($username: String!) {
    viewer {
      profile(username: $username) {
        name
        username
        imageUrl
        createdOn
      }
    }
  }
`;

export const ProfileHovercard = forwardRef<HTMLDivElement, ProfileHovercardProps>(
  ({ open, anchorEl, onClose, onMouseLeave, username }: ProfileHovercardProps, ref) => {
    const variables: GetProfileVariables = { username };
    const { data } = useQuery<GetProfileData, GetProfileVariables>(getProfileQuery, { variables, skip: !open });

    if (!data || !data.viewer.profile) {
      return null;
    }

    const {
      viewer: { profile },
    } = data;
    return (
      <Popover
        open={open}
        onClose={onClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        elevation={0}
        sx={{
          pointerEvents: 'none',
        }}
        slotProps={{
          paper: {
            ref,
            onMouseLeave,
            sx: {
              pointerEvents: 'auto',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: (theme) => theme.spacing(0.5),
            padding: (theme) => theme.spacing(2),
            width: (theme) => theme.spacing(50),
          }}
        >
          <Avatar
            component={RouterLink}
            to={`/profiles/${profile.username}`}
            alt={profile.name}
            src={profile.imageUrl}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: (theme) => theme.spacing(1) }}>
            <Link
              component={RouterLink}
              to={`/profiles/${profile.username}`}
              color="inherit"
              underline="hover"
              sx={{ fontWeight: 'bold' }}
            >
              {profile.username}
            </Link>
            <Typography variant="body1">{profile.name}</Typography>
          </Box>
          <Box
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: (theme) => theme.spacing(0.5) }}
          >
            <CalendarMonthIcon fontSize="small" />
            <Typography variant="body2">Joined {formatTime(new Date(profile.createdOn))}</Typography>
          </Box>
        </Box>
      </Popover>
    );
  }
);
