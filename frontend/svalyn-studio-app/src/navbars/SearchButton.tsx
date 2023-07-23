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

import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { SearchButtonProps } from './SearchButton.types';

export const SearchButton = ({ onClick }: SearchButtonProps) => {
  var isApple = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
  return (
    <Button
      sx={{ color: 'inherit', border: (theme) => `1px solid ${theme.palette.background.paper}` }}
      startIcon={<SearchIcon fontSize="small" color="inherit" />}
      onClick={onClick}
      size="small"
    >
      Search...
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          border: (theme) => `1px solid ${theme.palette.background.paper}`,
          borderRadius: '3px',
          marginLeft: (theme) => theme.spacing(4),
          fontSize: '0.75rem',
          fontWeight: '700',
          lineHeight: '20px',
          padding: '0px 4px',
          fontFamily: 'sans-serif',
          opacity: 0.7,
        }}
      >
        {isApple ? '⌘ ' : 'Ctrl '}+ K
      </Box>
    </Button>
  );
};
