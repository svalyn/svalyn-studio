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

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ProfileHovercard } from '../hovercards/ProfileHovercard';
import { PersonProps } from './Person.types';

export const Person = ({ profile, variant }: PersonProps) => {
  const [state, setState] = useState<HTMLElement | null>(null);

  const textRef = useRef<HTMLDivElement>(null);
  const pophoverRef = useRef<HTMLDivElement>(null);

  const handlePopoverClose = () => setState(null);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => setState(event.currentTarget);
  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.relatedTarget instanceof HTMLElement && textRef.current && pophoverRef.current) {
      const isOverPopover = pophoverRef.current.contains(event.relatedTarget);
      const isOverText = textRef.current.contains(event.relatedTarget);

      if (!isOverPopover && !isOverText) {
        setState(null);
      }
    }
  };

  return (
    <>
      <Box
        ref={textRef}
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(0.5) }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Tooltip title={profile.name}>
          <Avatar
            component={RouterLink}
            to={`/profiles/${profile.username}`}
            alt={profile.name}
            src={profile.imageUrl}
            sx={{ width: 24, height: 24 }}
          />
        </Tooltip>
        <Link
          variant={variant}
          component={RouterLink}
          to={`/profiles/${profile.username}`}
          color="inherit"
          underline="hover"
          sx={{ fontWeight: 'bold' }}
        >
          {profile.username}
        </Link>
      </Box>
      <ProfileHovercard
        ref={pophoverRef}
        open={state !== null}
        anchorEl={state}
        onClose={handlePopoverClose}
        onMouseLeave={handleMouseLeave}
        username={profile.username}
      />
    </>
  );
};
