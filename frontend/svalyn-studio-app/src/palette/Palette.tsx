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

import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import HomeIcon from '@mui/icons-material/Home';
import HubIcon from '@mui/icons-material/Hub';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaletteAction, PaletteProps, PaletteState } from './Palette.types';

export const Palette = ({ open, onClose }: PaletteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const navigate = useNavigate();

  const goToHome: PaletteAction = {
    id: 'go-to-home',
    icon: <HomeIcon fontSize="small" />,
    label: 'Home',
    handle: () => navigate(`/`),
  };
  const goToDomains: PaletteAction = {
    id: 'go-to-domains',
    icon: <HubIcon fontSize="small" />,
    label: 'Domains',
    handle: () => navigate(`/domains`),
  };
  const goToNewOrganization: PaletteAction = {
    id: 'go-to-new-organization',
    icon: <CorporateFareIcon fontSize="small" />,
    label: 'New organization',
    handle: () => navigate(`/new/organization`),
  };

  const defaultPaletteActions: PaletteAction[] = [goToHome, goToDomains, goToNewOrganization];

  const [state, setState] = useState<PaletteState>({
    query: '',
    actions: defaultPaletteActions,
    selectedActionId: null,
  });

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, query: value }));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter') {
      navigate(`/search?q=${encodeURIComponent(state.query)}`);
      onClose();
    } else if (event.key === 'ArrowDown' && listRef.current) {
      const firstListItem = listRef.current.childNodes[0];
      if (firstListItem instanceof HTMLElement) {
        const firstListItemButton = firstListItem.childNodes[0];
        if (firstListItemButton instanceof HTMLElement) {
          firstListItemButton.focus();
        }
      }
    }
  };

  const handleListItemKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'ArrowDown') {
      const nextListItemButton = event.currentTarget.parentElement?.nextSibling?.childNodes[0];
      if (nextListItemButton instanceof HTMLElement) {
        nextListItemButton.focus();
      }
    } else if (event.key === 'ArrowUp') {
      const previousListItemButton = event.currentTarget.parentElement?.previousSibling?.childNodes[0];
      if (previousListItemButton instanceof HTMLElement) {
        previousListItemButton.focus();
      } else {
        const input = inputRef.current?.querySelector('input');
        if (input) {
          input.focus();
        }
      }
    }
  };

  const handleOnActionClick = (action: PaletteAction) => {
    action.handle();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <FormControl
          variant="standard"
          fullWidth
          sx={{ paddingX: (theme) => theme.spacing(1), paddingY: (theme) => theme.spacing(0.5) }}
        >
          <Input
            value={state.query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            placeholder="Search..."
            disableUnderline
            autoFocus
            fullWidth
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="medium" />
              </InputAdornment>
            }
            inputProps={{
              style: {
                fontSize: '1.5rem',
              },
            }}
          />
        </FormControl>
        <Divider />
        <List ref={listRef} disablePadding>
          {state.actions.map((action) => (
            <ListItem key={action.id} disablePadding>
              <ListItemButton onClick={() => handleOnActionClick(action)} onKeyDown={handleListItemKeyDown}>
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Dialog>
  );
};
