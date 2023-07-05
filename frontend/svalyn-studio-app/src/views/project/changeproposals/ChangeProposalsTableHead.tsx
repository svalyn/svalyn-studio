/*
 * Copyright (c) 2022 Stéphane Bégaudeau.
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

import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ChangeProposalsTableHeadProps } from './ChangeProposalsTableHead.types';

export const ChangeProposalsTableHead = ({
  filter,
  onFilterChange,
  changeProposalsCount,
  selectedChangeProposalsCount,
  onSelectAll,
}: ChangeProposalsTableHeadProps) => {
  const handleChange = (event: SelectChangeEvent<'OPEN' | 'CLOSED'>) => {
    const {
      target: { value },
    } = event;
    if (value === 'OPEN' || value === 'CLOSED') {
      onFilterChange(value);
    }
  };

  return (
    <TableHead>
      <TableRow sx={{ borderLeft: '3px solid transparent' }}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={changeProposalsCount > 0 && selectedChangeProposalsCount === changeProposalsCount}
            onChange={onSelectAll}
            indeterminate={selectedChangeProposalsCount > 0 && selectedChangeProposalsCount < changeProposalsCount}
          />
        </TableCell>
        <TableCell>
          <FormControl sx={{ minWidth: (theme) => theme.spacing(15) }} size="small">
            <InputLabel id="change-proposal-status-label">Status</InputLabel>
            <Select labelId="change-proposal-status-label" value={filter} label="Status" onChange={handleChange}>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="CLOSED">Close</MenuItem>
            </Select>
          </FormControl>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
