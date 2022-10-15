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
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import {
  EditReadMeData,
  EditReadMeDialogProps,
  EditReadMeDialogState,
  EditReadMeVariables,
  ErrorPayload,
} from './EditReadMeDialog.types';

const editReadMeMutation = gql`
  mutation editReadMe($input: EditReadMeInput!) {
    editReadMe(input: $input) {
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const EditReadMeDialog = ({ projectIdentifier, open, content, onClose }: EditReadMeDialogProps) => {
  const [state, setState] = useState<EditReadMeDialogState>({ value: content });

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, value }));
  };

  const [editReadMe, { loading, data, error }] = useMutation<EditReadMeData, EditReadMeVariables>(editReadMeMutation);
  useEffect(() => {
    if (!loading) {
      if (data) {
        const { editReadMe } = data;
        if (editReadMe.__typename === 'EditReadMeSuccessPayload') {
          onClose();
        } else if (editReadMe.__typename === 'ErrorPayload') {
          const errorPayload = editReadMe as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message, editReadMeDialogOpen: false }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message, editReadMeDialogOpen: false }));
      }
    }
  }, [loading, data, error]);

  const handleUpdate: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: EditReadMeVariables = {
      input: {
        projectIdentifier,
        content: state.value,
      },
    };
    editReadMe({ variables });
  };

  return (
    <Dialog open={open} scroll="paper" onClose={onClose} keepMounted={false} maxWidth="md" fullWidth>
      <DialogTitle>README</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          <TextField
            label="README"
            value={state.value}
            onChange={handleChange}
            multiline
            minRows={20}
            maxRows={20}
            fullWidth
            autoFocus
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpdate}>Update</Button>
      </DialogActions>
    </Dialog>
  );
};
