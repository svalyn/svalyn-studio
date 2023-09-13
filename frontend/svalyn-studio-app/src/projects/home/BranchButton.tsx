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

import { gql, useQuery } from '@apollo/client';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Check from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useProject } from '../useProject';
import {
  BranchButtonMenuProps,
  BranchButtonMenuState,
  BranchButtonProps,
  BranchButtonState,
  GetProjectBranchesDetailsData,
  GetProjectBranchesDetailsVariables,
} from './BranchButton.types';

export const BranchButton = ({ branchName }: BranchButtonProps) => {
  const [state, setState] = useState<BranchButtonState>({
    menuAnchorElement: null,
  });

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const { currentTarget } = event;
    setState((prevState) => ({ ...prevState, menuAnchorElement: currentTarget }));
  };

  const handleClose = () => {
    setState((prevState) => ({ ...prevState, menuAnchorElement: null }));
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleClick}
        startIcon={<AltRouteIcon />}
        endIcon={<ArrowDropDownIcon />}
        sx={{ backgroundColor: (theme) => theme.palette.background.paper }}
      >
        {branchName}
      </Button>
      {state.menuAnchorElement ? (
        <BranchButtonMenu
          anchorElement={state.menuAnchorElement}
          currentBranchName={branchName}
          onClose={handleClose}
        />
      ) : null}
    </>
  );
};

const getProjectBranchesDetailsQuery = gql`
  query getProjectBranchesDetails($projectIdentifier: ID!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      project(identifier: $projectIdentifier) {
        branches(page: $page, rowsPerPage: $rowsPerPage) {
          edges {
            node {
              name
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    }
  }
`;

const BranchButtonMenu = ({ currentBranchName, anchorElement, onClose }: BranchButtonMenuProps) => {
  const [state, setState] = useState<BranchButtonMenuState>({
    page: 0,
    rowsPerPage: 10,
  });

  const { identifier: projectIdentifier } = useProject();

  const variables: GetProjectBranchesDetailsVariables = {
    projectIdentifier,
    page: state.page,
    rowsPerPage: state.rowsPerPage,
  };
  const { data, error } = useQuery<GetProjectBranchesDetailsData, GetProjectBranchesDetailsVariables>(
    getProjectBranchesDetailsQuery,
    { variables }
  );

  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  const handlePreviousPageClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    setState((prevState) => ({ ...prevState, page: prevState.page - 1 }));
  };

  const handleNextPageClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    setState((prevState) => ({ ...prevState, page: prevState.page + 1 }));
  };

  if (!data) {
    return null;
  }
  return (
    <Menu open anchorEl={anchorElement} onClose={onClose}>
      {data.viewer.project.branches.edges
        .map((edge) => edge.node)
        .map((branch) => {
          return (
            <MenuItem
              component={RouterLink}
              to={`/projects/${projectIdentifier}/branches/${branch.name}`}
              onClick={onClose}
              selected={currentBranchName === branch.name}
              key={branch.name}
              sx={{
                minWidth: (theme) => theme.spacing(30),
              }}
            >
              {currentBranchName === branch.name ? (
                <ListItemIcon>
                  <Check />
                </ListItemIcon>
              ) : null}
              <ListItemText inset={currentBranchName !== branch.name}>{branch.name}</ListItemText>
            </MenuItem>
          );
        })}
      <Divider />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingX: (theme) => theme.spacing(1),
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={handlePreviousPageClick}
          disabled={!data.viewer.project.branches.pageInfo.hasPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNextPageClick}
          disabled={!data.viewer.project.branches.pageInfo.hasNextPage}
        >
          Next
        </Button>
      </Box>
    </Menu>
  );
};
