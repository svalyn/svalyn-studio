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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Grow from '@mui/material/Grow';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ReviewDialog } from '../ReviewDialog';
import {
  ChangeProposalReviewsProps,
  ChangeProposalStatusHeaderProps,
  ChangeProposalStatusProps,
  ChangeProposalStatusState,
  ErrorPayload,
  ReviewAccordionDetailsProps,
  ReviewAccordionProps,
  ReviewAccordionSummaryProps,
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

export const ChangeProposalStatus = ({ changeProposal, onStatusUpdated }: ChangeProposalStatusProps) => {
  const [state, setState] = useState<ChangeProposalStatusState>({
    selectedOptionIndex: 0,
    reviewDialogOpen: false,
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
        if (updateChangeProposalStatus.__typename === 'SuccessPayload') {
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
        id: crypto.randomUUID(),
        changeProposalId: changeProposal.id,
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

  const openReviewDialog: React.MouseEventHandler<HTMLButtonElement> = () =>
    setState((prevState) => ({ ...prevState, reviewDialogOpen: true }));
  const closeReviewDialog = () => setState((prevState) => ({ ...prevState, reviewDialogOpen: false }));
  const handleReviewed = () => {
    setState((prevState) => ({ ...prevState, reviewDialogOpen: false }));
    onStatusUpdated();
  };

  return (
    <>
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <ChangeProposalStatusHeader changeProposal={changeProposal} />
          <ChangeProposalReviews changeProposal={changeProposal} />
        </Box>
        <Box
          sx={{
            padding: (theme) => theme.spacing(2),
            display: 'flex',
            flexDirection: 'row',
            gap: (theme) => theme.spacing(2),
          }}
        >
          <Button
            variant="outlined"
            startIcon={<CommentIcon />}
            onClick={openReviewDialog}
            disabled={changeProposal.status !== 'OPEN'}
          >
            Review Change Proposal
          </Button>
          <ButtonGroup
            variant="outlined"
            ref={anchorRef}
            disabled={
              changeProposal.status !== 'OPEN' ||
              changeProposal.reviews.edges
                .map((edge) => edge.node)
                .filter((review) => review.status === 'REQUESTED_CHANGES').length > 0 ||
              changeProposal.reviews.edges.map((edge) => edge.node).filter((review) => review.status === 'APPROVED')
                .length === 0
            }
            aria-label="split button"
          >
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
          <Popper
            sx={{ zIndex: 1 }}
            open={state.actionButtonOpen}
            anchorEl={anchorRef.current}
            transition
            disablePortal
          >
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
      <ReviewDialog
        changeProposalId={changeProposal.id}
        open={state.reviewDialogOpen}
        onClose={closeReviewDialog}
        onReviewed={handleReviewed}
      />
    </>
  );
};

const ChangeProposalStatusHeader = ({ changeProposal }: ChangeProposalStatusHeaderProps) => {
  let title = <Typography variant="h5">Waiting for review</Typography>;
  let description = 'At least 1 approving review is required to integrate this change proposal';
  let icon = <PanoramaFishEyeIcon fontSize="large" />;

  const approvedReviewsCount = changeProposal.reviews.edges
    .map((edge) => edge.node)
    .filter((review) => review.status === 'APPROVED').length;
  const requestedChangeReviewsCount = changeProposal.reviews.edges
    .map((edge) => edge.node)
    .filter((review) => review.status === 'REQUESTED_CHANGES').length;
  if (requestedChangeReviewsCount > 0) {
    title = (
      <Typography variant="h5" color="error.main">
        Update requested
      </Typography>
    );
    description = `${requestedChangeReviewsCount} ${
      requestedChangeReviewsCount === 1 ? 'review is' : 'reviews are'
    } asking for an update to this change proposal.`;
    icon = <NotInterestedIcon fontSize="large" color="error" />;
  } else if (approvedReviewsCount > 0) {
    title = (
      <Typography variant="h5" color="success.main">
        Approved
      </Typography>
    );
    description = `${approvedReviewsCount} ${
      approvedReviewsCount === 1 ? 'review has' : 'reviews have'
    } approved this change proposal.`;
    icon = <CheckCircleOutlineIcon fontSize="large" color="success" />;
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: (theme) => theme.spacing(2),
        paddingX: (theme) => theme.spacing(2),
        paddingY: (theme) => theme.spacing(1),
      }}
    >
      {icon}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {title}
        <Typography>{description}</Typography>
      </Box>
    </Box>
  );
};

const ChangeProposalReviews = ({ changeProposal }: ChangeProposalReviewsProps) => {
  const hasReviews = changeProposal.reviews.edges.length > 0;
  if (!hasReviews) {
    return <Typography sx={{ paddingX: (theme) => theme.spacing(2) }}>No reviews have been performed yet</Typography>;
  }

  const approvedReviews = changeProposal.reviews.edges
    .map((edge) => edge.node)
    .filter((review) => review.status === 'APPROVED');
  const requestedChangesReviews = changeProposal.reviews.edges
    .map((edge) => edge.node)
    .filter((review) => review.status === 'REQUESTED_CHANGES');

  const approvedReviewsAccordion =
    approvedReviews.length > 0 ? (
      <ReviewAccordion>
        <ReviewAccordionSummary expandIcon={<ExpandMoreIcon />} status="approved">
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(1) }}>
            <CheckCircleOutlineIcon fontSize="small" color="success" />
            <Typography>{approvedReviews.length} approval(s)</Typography>
          </Box>
        </ReviewAccordionSummary>
        <ReviewAccordionDetails>
          {approvedReviews.map((review) => (
            <Box
              key={review.id}
              sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(0.5) }}
            >
              <Tooltip title={review.createdBy.name}>
                <Avatar
                  component={RouterLink}
                  to={`/profile/${review.createdBy.username}`}
                  alt={review.createdBy.name}
                  src={review.createdBy.imageUrl}
                  sx={{ width: 24, height: 24 }}
                />
              </Tooltip>
              <Link variant="body1" component={RouterLink} to={`/profile/${review.createdBy.username}`}>
                {review.createdBy.username}
              </Link>
              <Typography> approved these changes</Typography>
            </Box>
          ))}
        </ReviewAccordionDetails>
      </ReviewAccordion>
    ) : null;

  const requestedChangesReviewsAccordion =
    requestedChangesReviews.length > 0 ? (
      <ReviewAccordion>
        <ReviewAccordionSummary status="changes-requested" expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(1) }}>
            <NotInterestedIcon fontSize="small" color="error" />
            <Typography>{requestedChangesReviews.length} update(s) requested</Typography>
          </Box>
        </ReviewAccordionSummary>
        <ReviewAccordionDetails>
          {requestedChangesReviews.map((review) => (
            <Box
              key={review.id}
              sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: (theme) => theme.spacing(0.5) }}
            >
              <Tooltip title={review.createdBy.name}>
                <Avatar
                  component={RouterLink}
                  to={`/profile/${review.createdBy.username}`}
                  alt={review.createdBy.name}
                  src={review.createdBy.imageUrl}
                  sx={{ width: 24, height: 24 }}
                />
              </Tooltip>
              <Link variant="body1" component={RouterLink} to={`/profile/${review.createdBy.username}`}>
                {review.createdBy.username}
              </Link>
              <Typography> requested updates</Typography>
            </Box>
          ))}
        </ReviewAccordionDetails>
      </ReviewAccordion>
    ) : null;

  return (
    <Box
      sx={{
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {approvedReviewsAccordion}
      {requestedChangesReviewsAccordion}
    </Box>
  );
};

const ReviewAccordion = ({ children }: ReviewAccordionProps) => {
  return (
    <Accordion
      elevation={0}
      disableGutters
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        '&:last-child': { borderBottom: 0 },
        '&:before': { display: 'none' },
      }}
    >
      {children}
    </Accordion>
  );
};

const ReviewAccordionSummary = ({ status, expandIcon, children }: ReviewAccordionSummaryProps) => {
  return (
    <AccordionSummary
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        '&:not(:last-child)': { borderBottom: 0 },
      }}
      expandIcon={expandIcon}
      aria-controls={`${status}-reviews-content`}
      id={`${status}-reviews-header`}
    >
      {children}
    </AccordionSummary>
  );
};

const ReviewAccordionDetails = ({ children }: ReviewAccordionDetailsProps) => {
  return (
    <AccordionDetails
      sx={{
        paddingY: (theme) => theme.spacing(2),
        paddingX: (theme) => theme.spacing(4),
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {children}
    </AccordionDetails>
  );
};
