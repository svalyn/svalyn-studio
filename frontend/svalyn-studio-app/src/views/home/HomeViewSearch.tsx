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
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import { HomeViewSearchState } from './HomeViewSearch.types';

export const HomeViewSearch = () => {
  const [state, setState] = useState<HomeViewSearchState>({
    query: '',
  });

  const handleQueryChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, query: value }));
  };

  return (
    <Paper variant="outlined" sx={{ paddingX: (theme) => theme.spacing(2) }}>
      <FormControl variant="standard" fullWidth>
        <Input
          value={state.query}
          onChange={handleQueryChange}
          placeholder="Search..."
          disableUnderline
          autoFocus
          fullWidth
          disabled
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon fontSize="large" />
            </InputAdornment>
          }
          inputProps={{
            style: {
              fontSize: '2rem',
            },
          }}
        />
      </FormControl>
    </Paper>
  );
};
