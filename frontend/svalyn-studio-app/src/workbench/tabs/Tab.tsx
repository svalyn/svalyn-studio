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

import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TabProps } from './Tab.types';

export const Tab = ({ resource, currentResourceId, onOpen, onClose }: TabProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 'none',
        whiteSpace: 'nowrap',
        gap: (theme) => theme.spacing(0.5),
        px: (theme) => theme.spacing(2),
        cursor: 'pointer',
        backgroundColor: (theme) =>
          resource.id === currentResourceId ? theme.palette.background.paper : theme.palette.background.default,
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      onClick={() => onOpen(resource)}
    >
      <InsertDriveFileOutlinedIcon
        fontSize="small"
        sx={{
          color: (theme) =>
            resource.id === currentResourceId ? theme.palette.primary.main : theme.palette.text.primary,
        }}
      />
      <Typography
        variant="tbody2"
        sx={{
          color: (theme) =>
            resource.id === currentResourceId ? theme.palette.primary.main : theme.palette.text.primary,
        }}
      >
        {resource.name}
      </Typography>
      <CloseIcon sx={{ fontSize: (theme) => theme.spacing(2) }} onClick={(event) => onClose(event, resource)} />
    </Box>
  );
};
