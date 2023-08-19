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

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Theme, alpha } from '@mui/material/styles';
import { VariantType } from '../../snackbar/ErrorSnackbar.types';
import { ConsoleLineProps } from './ConsoleLine.types';

const getTextColor = (theme: Theme, severity: VariantType): string => {
  let textColor = theme.palette.getContrastText(theme.palette.code.main);
  if (severity === 'error') {
    textColor = theme.palette.error[theme.palette.mode];
  } else if (severity === 'warning') {
    textColor = theme.palette.warning[theme.palette.mode];
  } else if (severity === 'success') {
    textColor = theme.palette.success[theme.palette.mode];
  }
  return textColor;
};

export const ConsoleLine = ({ index, line, severity }: ConsoleLineProps) => {
  return (
    <Box
      key={index}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: (theme) => theme.spacing(2),
        paddingY: (theme) => theme.spacing(0.25),
        color: (theme) => alpha(getTextColor(theme, severity), 0.7),
        '&:hover': {
          color: (theme) => getTextColor(theme, severity),
          backgroundColor: (theme) => alpha(theme.palette.divider, 0.1),
        },
      }}
    >
      <Typography
        variant="tcontent"
        sx={{
          width: (theme) => theme.spacing(6),
          textAlign: 'right',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        {index}
      </Typography>
      <Typography
        variant="tcontent"
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        {line}
      </Typography>
    </Box>
  );
};
