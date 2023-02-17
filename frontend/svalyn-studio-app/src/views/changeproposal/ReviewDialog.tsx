/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import {
  ErrorPayload,
  PerformReviewData,
  PerformReviewVariables,
  ReviewDialogProps,
  ReviewDialogState,
} from './ReviewDialog.types';

const performReviewMutation = gql`
  mutation performReview($input: PerformReviewInput!) {
    performReview(input: $input) {
      __typename
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const ReviewDialog = ({ changeProposalId, open, onClose, onReviewed }: ReviewDialogProps) => {
  const [state, setState] = useState<ReviewDialogState>({
    review: '',
    status: 'APPROVED',
    message: null,
  });

  const [performReview, { loading, data, error }] = useMutation<PerformReviewData, PerformReviewVariables>(
    performReviewMutation
  );
  useEffect(() => {
    if (!loading) {
      if (data) {
        const { performReview } = data;
        if (performReview.__typename === 'SuccessPayload') {
          onReviewed();
        } else if (performReview.__typename === 'ErrorPayload') {
          const errorPayload = performReview as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const handleReviewChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    const {
      target: { value },
    } = event;
    setState((prevState) => ({ ...prevState, review: value }));
  };

  const handleStatusChange = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === 'APPROVED' || value === 'REQUESTED_CHANGES') {
      setState((prevState) => ({ ...prevState, status: value }));
    }
  };

  const onSubmitReview: React.MouseEventHandler<HTMLButtonElement> = () => {
    const variables: PerformReviewVariables = {
      input: {
        id: uuid(),
        changeProposalId,
        message: state.review,
        status: state.status,
      },
    };
    performReview({ variables });
  };

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Review the change proposal</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ marginBottom: (theme) => theme.spacing(1) }}>
            Leave a message on this change proposal
          </DialogContentText>
          <TextField
            value={state.review}
            onChange={handleReviewChange}
            label="Message"
            variant="outlined"
            multiline
            minRows={5}
            fullWidth
            sx={{ marginBottom: (theme) => theme.spacing(1) }}
          />
          <FormControl>
            <FormLabel id="changeproposal-review-status-label">Status</FormLabel>
            <RadioGroup
              aria-labelledby="changeproposal-review-status-label"
              value={state.status}
              onChange={handleStatusChange}
            >
              <FormControlLabel value="APPROVED" control={<Radio />} label="Approved" />
              <FormControlLabel value="REQUESTED_CHANGES" control={<Radio />} label="Requested changes" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmitReview}>Submit Review</Button>
        </DialogActions>
      </Dialog>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
