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

import { gql, useMutation, useQuery } from '@apollo/client';
import DoneIcon from '@mui/icons-material/Done';
import InboxIcon from '@mui/icons-material/Inbox';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Navbar } from '../../navbars/Navbar';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import { formatTime } from '../../utils/formatTime';
import { NavigationsTableHead } from './NotificationsTableHead';
import { NotificationsTableToolbar } from './NotificationsTableToolbar';
import {
  ErrorPayload,
  GetNotificationsData,
  GetNotificationsVariables,
  Notification,
  NotificationStatus,
  NotificationTab,
  NotificationViewState,
  UpdateNotificationsStatusData,
  UpdateNotificationsStatusVariables,
} from './NotificationsView.types';

const getNotificationsQuery = gql`
  query getNotifications($status: [NotificationStatus!]!, $page: Int!, $rowsPerPage: Int!) {
    viewer {
      notifications(status: $status, page: $page, rowsPerPage: $rowsPerPage) {
        edges {
          node {
            id
            title
            status
            createdOn
          }
        }
        pageInfo {
          count
        }
      }
    }
  }
`;

const updateNotificationsStatusMutation = gql`
  mutation updateNotificationsStatus($input: UpdateNotificationsStatusInput!) {
    updateNotificationsStatus(input: $input) {
      __typename
      ... on ErrorPayload {
        message
      }
    }
  }
`;

export const NotificationsView = () => {
  const [state, setState] = useState<NotificationViewState>({
    tab: 'Inbox',
    notifications: null,
    selectedNotifications: [],
    page: 0,
    rowsPerPage: 20,
    message: null,
  });

  const status: NotificationStatus[] = state.tab === 'Inbox' ? ['READ', 'UNREAD'] : ['DONE'];
  const variables: GetNotificationsVariables = { status, page: state.page, rowsPerPage: state.rowsPerPage };
  const { loading, data, error, refetch } = useQuery<GetNotificationsData, GetNotificationsVariables>(
    getNotificationsQuery,
    {
      variables,
    }
  );
  useEffect(() => {
    if (!loading) {
      if (data) {
        const {
          viewer: { notifications },
        } = data;
        if (notifications) {
          setState((prevState) => ({ ...prevState, notifications, selectedNotifications: [] }));
        }
      }
      if (error) {
        setState((prevState) => ({ ...prevState, message: error.message }));
      }
    }
  }, [loading, data, error]);

  const [
    updateNotificationsStatus,
    {
      loading: updateNotificationsStatusLoading,
      data: updateNotificationsStatusData,
      error: updateNotificationsStatusError,
    },
  ] = useMutation<UpdateNotificationsStatusData, UpdateNotificationsStatusVariables>(updateNotificationsStatusMutation);
  useEffect(() => {
    if (!updateNotificationsStatusLoading) {
      if (updateNotificationsStatusData) {
        const { updateNotificationsStatus } = updateNotificationsStatusData;
        if (updateNotificationsStatus.__typename === 'SuccessPayload') {
          refetch(variables);
        } else if (updateNotificationsStatus.__typename === 'ErrorPayload') {
          const errorPayload = updateNotificationsStatus as ErrorPayload;
          setState((prevState) => ({ ...prevState, message: errorPayload.message }));
        }
      }
      if (updateNotificationsStatusError) {
        setState((prevState) => ({ ...prevState, message: updateNotificationsStatusError.message }));
      }
    }
  }, [updateNotificationsStatusLoading, updateNotificationsStatusData, updateNotificationsStatusError]);

  const selectTab = (tab: NotificationTab) =>
    setState((prevState) => ({ ...prevState, tab, selectedNotifications: [] }));

  const selectAllNotifications = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setState((prevState) => {
        let selectedNotifications: string[] = prevState.selectedNotifications;
        if (prevState.notifications) {
          selectedNotifications = prevState.notifications.edges.map((edge) => edge.node.id);
        }
        return { ...prevState, selectedNotifications };
      });
    } else {
      setState((prevState) => ({ ...prevState, selectedNotifications: [] }));
    }
  };

  const selectNotification = (_: React.MouseEvent<HTMLTableRowElement, MouseEvent>, notification: Notification) => {
    setState((prevState) => {
      const selectedNotificationIndex: number = prevState.selectedNotifications.indexOf(notification.id);
      let selectedNotifications: string[] = [];

      if (selectedNotificationIndex === -1) {
        selectedNotifications = [...prevState.selectedNotifications, notification.id];
      } else if (selectedNotificationIndex === 0) {
        selectedNotifications = [...prevState.selectedNotifications.slice(1)];
      } else if (selectedNotificationIndex === prevState.selectedNotifications.length - 1) {
        selectedNotifications = [...prevState.selectedNotifications.slice(0, -1)];
      } else if (selectedNotificationIndex > 0) {
        selectedNotifications = [
          ...prevState.selectedNotifications.slice(0, selectedNotificationIndex),
          ...prevState.selectedNotifications.slice(selectedNotificationIndex + 1),
        ];
      }

      return { ...prevState, selectedNotifications };
    });
  };

  const onPageChange = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) =>
    setState((prevState) => ({ ...prevState, page }));

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  return (
    <>
      <div>
        <Navbar />
        <Box sx={{ paddingX: (theme) => theme.spacing(2) }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: '1fr',
              gridTemplateColumns: '1fr 5fr',
              gap: (theme) => theme.spacing(2),
            }}
          >
            <Box sx={{ paddingY: (theme) => theme.spacing(1) }}>
              <List>
                <ListItem disablePadding selected={state.tab === 'Inbox'} onClick={() => selectTab('Inbox')}>
                  <ListItemButton>
                    <ListItemIcon>
                      <InboxIcon />
                    </ListItemIcon>
                    <ListItemText primary="Inbox" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding selected={state.tab === 'Done'} onClick={() => selectTab('Done')}>
                  <ListItemButton>
                    <ListItemIcon>
                      <DoneIcon />
                    </ListItemIcon>
                    <ListItemText primary="Done" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
            <Box sx={{ paddingY: (theme) => theme.spacing(2) }}>
              {state.notifications ? (
                <>
                  <NotificationsTableToolbar
                    onMarkAsDone={() =>
                      updateNotificationsStatus({
                        variables: {
                          input: { id: uuid(), notificationIds: state.selectedNotifications, status: 'DONE' },
                        },
                      })
                    }
                    onMarkAsRead={() =>
                      updateNotificationsStatus({
                        variables: {
                          input: { id: uuid(), notificationIds: state.selectedNotifications, status: 'READ' },
                        },
                      })
                    }
                    onMarkAsUnread={() =>
                      updateNotificationsStatus({
                        variables: {
                          input: { id: uuid(), notificationIds: state.selectedNotifications, status: 'UNREAD' },
                        },
                      })
                    }
                    selectedNotificationsCount={state.selectedNotifications.length}
                  />
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <NavigationsTableHead
                        notificationsCount={state.notifications.edges.length}
                        selectedNotificationsCount={state.selectedNotifications.length}
                        onSelectAll={selectAllNotifications}
                      />
                      <TableBody>
                        {state.notifications.edges
                          .map((edge) => edge.node)
                          .map((notification) => {
                            const isNotificationSelected = state.selectedNotifications.includes(notification.id);
                            return (
                              <TableRow
                                sx={{
                                  borderLeft: (theme) =>
                                    `3px solid ${
                                      notification.status === 'UNREAD' ? theme.palette.primary.main : 'transparent'
                                    }`,
                                }}
                                key={notification.id}
                                onClick={(event) => selectNotification(event, notification)}
                              >
                                <TableCell padding="checkbox">
                                  <Checkbox checked={isNotificationSelected} />
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      color: (theme) =>
                                        notification.status === 'UNREAD'
                                          ? theme.palette.text.primary
                                          : theme.palette.text.disabled,
                                    }}
                                  >
                                    {notification.title}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={notification.createdOn}>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        color: (theme) =>
                                          notification.status === 'UNREAD'
                                            ? theme.palette.text.primary
                                            : theme.palette.text.disabled,
                                      }}
                                    >
                                      {formatTime(new Date(notification.createdOn))}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    sx={{ borderBottom: 'none' }}
                    component="div"
                    onPageChange={onPageChange}
                    rowsPerPageOptions={[20]}
                    rowsPerPage={20}
                    page={state.page}
                    count={state.notifications.pageInfo.count}
                  />
                </>
              ) : null}
            </Box>
          </Box>
        </Box>
      </div>
      <ErrorSnackbar message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
