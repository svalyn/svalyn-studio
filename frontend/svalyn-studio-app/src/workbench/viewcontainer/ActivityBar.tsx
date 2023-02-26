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

import { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { ActivityBarProps, IconProps } from './ActivityBar.types';

export const ActivityBar = ({ views, selectedViewId, onClick }: ActivityBarProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {views.map((view) => {
        const sx: SxProps<Theme> = {
          color: (theme) => (view.id === selectedViewId ? theme.palette.text.primary : theme.palette.text.disabled),
          '&:hover': {
            color: (theme) => theme.palette.text.primary,
          },
        };
        const iconProps: IconProps = {
          sx,
        };
        return (
          <Box
            key={view.id}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: (theme) => theme.spacing(6),
              width: (theme) => theme.spacing(6),
              borderLeft: (theme) =>
                view.id === selectedViewId
                  ? `3px solid ${theme.palette.primary.main}`
                  : `3px solid ${theme.palette.background.paper}`,
            }}
            onClick={() => onClick(view)}
          >
            <Tooltip title={view.title} placement="right">
              {React.createElement(view.icon, iconProps)}
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
};
