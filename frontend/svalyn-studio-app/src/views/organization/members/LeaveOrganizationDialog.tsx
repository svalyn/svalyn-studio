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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorSnackbar } from '../../../snackbar/ErrorSnackbar';
import {
  ErrorPayload,
  LeaveOrganizationData,
  LeaveOrganizationDialogProps,
  LeaveOrganizationDialogState,
  LeaveOrganizationVariables,
} from './LeaveOrganizationDialog.types';

const leaveOrganizationMutation = gql`
  mutation leaveOrganization($input: LeaveOrganizationInput!) {
    leaveOrganization(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const LeaveOrganizationDialog = ({ organizationIdentifier, open, onClose }: LeaveOrganizationDialogProps) => {
  const [state, setState] = useState<LeaveOrganizationDialogState>({
    message: null,
  });

  const navigate = useNavigate();

  const [
    leaveOrganization,
    { loading: leaveOrganizationLoading, data: leaveOrganizationData, error: leaveOrganizationError },
  ] = useMutation<LeaveOrganizationData, LeaveOrganizationVariables>(leaveOrganizationMutation);
  useEffect(() => {
    if (!leaveOrganizationLoading) {
      if (leaveOrganizationData) {
        if (leaveOrganizationData.leaveOrganization.__typename === 'SuccessPayload') {
          navigate('/');
        } else if (leaveOrganizationData.leaveOrganization.__typename === 'ErrorPayload') {
          const { message } = leaveOrganizationData.leaveOrganization as ErrorPayload;
          setState((prevState) => ({ ...prevState, message }));
        }
      }
      if (leaveOrganizationError) {
        setState((prevState) => ({ ...prevState, message: leaveOrganizationError.message }));
      }
    }
  }, [leaveOrganizationLoading, leaveOrganizationData, leaveOrganizationError]);

  const handleLeaveOrganization: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: LeaveOrganizationVariables = {
      input: {
        id: crypto.randomUUID(),
        organizationIdentifier,
      },
    };

    leaveOrganization({ variables });
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="leave-organization-dialog-title"
        aria-describedby="leave-organization-dialog-description"
      >
        <DialogTitle id="leave-organization-dialog-title">Leave the organization</DialogTitle>
        <DialogContent>
          <DialogContentText id="leave-organization-dialog-description">
            By leaving, you won't be able to contribute to this organization anymore. In order to retrieve this ability
            again, you will need to be invited by an administrator.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleLeaveOrganization}>Leave</Button>
        </DialogActions>
      </Dialog>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
