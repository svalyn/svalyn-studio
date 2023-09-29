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
import { IItemIdentityProvider, IItemLabelProvider } from '../api/providers/ItemProviders.types';
import { useAdapterFactory } from '../api/providers/useAdapterFactory';
import { TabProps } from './Tab.types';

export const Tab = ({ object, currentObjectId, onOpen, onClose }: TabProps) => {
  const { adapterFactory } = useAdapterFactory();
  const identityProvider = adapterFactory.adapt<IItemIdentityProvider>(object, 'IItemIdentityProvider');
  const id = identityProvider?.getId(object) ?? '';

  const labelProvider = adapterFactory.adapt<IItemLabelProvider>(object, 'IItemLabelProvider');
  const label = labelProvider?.getText(object) ?? 'Unknown';

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
          id === currentObjectId ? theme.palette.background.paper : theme.palette.background.default,
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      onClick={() => onOpen(object)}
    >
      <InsertDriveFileOutlinedIcon
        fontSize="small"
        sx={{
          color: (theme) => (id === currentObjectId ? theme.palette.primary.main : theme.palette.text.primary),
        }}
      />
      <Typography
        variant="tbody2"
        sx={{
          color: (theme) => (id === currentObjectId ? theme.palette.primary.main : theme.palette.text.primary),
        }}
      >
        {label}
      </Typography>
      <CloseIcon sx={{ fontSize: (theme) => theme.spacing(2) }} onClick={(event) => onClose(event, object)} />
    </Box>
  );
};
