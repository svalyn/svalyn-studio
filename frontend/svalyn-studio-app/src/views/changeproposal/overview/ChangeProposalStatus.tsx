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

import { gql, useMutation } from '@apollo/client';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grow from '@mui/material/Grow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import {
  ChangeProposalStatusProps,
  ChangeProposalStatusState,
  ErrorPayload,
  UpdateChangeProposalStatusData,
  UpdateChangeProposalStatusVariables,
} from './ChangeProposalStatus.types';

const updateChangeProposalStatusMutation = gql`
  mutation updateChangeProposalStatus($input: UpdateChangeProposalStatusInput!) {
    updateChangeProposalStatus(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

const options = ['Integrate', 'Close'];

export const ChangeProposalStatus = ({ changeProposalId, onStatusUpdated }: ChangeProposalStatusProps) => {
  const [state, setState] = useState<ChangeProposalStatusState>({
    selectedOptionIndex: 0,
    actionButtonOpen: false,
  });
  const anchorRef = useRef<HTMLDivElement>(null);

  const [
    updateChangeProposalStatus,
    {
      loading: updateChangeProposalStatusLoading,
      data: updateChangeProposalStatusData,
      error: updateChangeProposalStatusError,
    },
  ] = useMutation<UpdateChangeProposalStatusData, UpdateChangeProposalStatusVariables>(
    updateChangeProposalStatusMutation
  );
  useEffect(() => {
    if (!updateChangeProposalStatusLoading) {
      if (updateChangeProposalStatusData) {
        const { updateChangeProposalStatus } = updateChangeProposalStatusData;
        if (updateChangeProposalStatus.__typename === 'UpdateChangeProposalStatusSuccessPayload') {
          onStatusUpdated();
        } else if (updateChangeProposalStatus.__typename === 'ErrorPayload') {
          const errorPayload = updateChangeProposalStatus as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message, editStatusDialogOpen: false }));
        }
      }
      if (updateChangeProposalStatusError) {
        setState((prevState) => ({
          ...prevState,
          message: updateChangeProposalStatusError.message,
          editStatusDialogOpen: false,
        }));
      }
    }
  }, [updateChangeProposalStatusLoading, updateChangeProposalStatusData, updateChangeProposalStatusError]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: UpdateChangeProposalStatusVariables = {
      input: {
        changeProposalId,
        status: state.selectedOptionIndex === 0 ? 'INTEGRATED' : 'CLOSED',
      },
    };
    updateChangeProposalStatus({ variables });
  };

  const handleToggle: React.MouseEventHandler<HTMLButtonElement> = () => {
    setState((prevState) => ({ ...prevState, actionButtonOpen: !prevState.actionButtonOpen }));
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setState((prevState) => ({ ...prevState, actionButtonOpen: false }));
  };

  const handleMenuItemClick = (_: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
    setState((prevState) => ({ ...prevState, selectedOptionIndex: index, actionButtonOpen: false }));
  };

  return (
    <Paper variant="outlined">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: (theme) => theme.spacing(2),
          py: '2px',
        }}
      >
        <Typography variant="subtitle1">Status</Typography>
      </Box>
      <Divider />
      <Box sx={{ padding: (theme) => theme.spacing(2) }}>
        <Typography>
          This change proposal is ready to be considered, have a look at its content and then add your review
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ padding: (theme) => theme.spacing(2) }}>
        <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
          <Button onClick={handleClick}>{options[state.selectedOptionIndex]}</Button>
          <Button
            size="small"
            onClick={handleToggle}
            aria-controls={state.actionButtonOpen ? 'split-button-menu' : undefined}
            aria-expanded={state.actionButtonOpen ? 'true' : undefined}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper sx={{ zIndex: 1 }} open={state.actionButtonOpen} anchorEl={anchorRef.current} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu" autoFocusItem>
                    {options.map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={index === state.selectedOptionIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Box>
    </Paper>
  );
};
