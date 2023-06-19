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
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ActivityTimeline } from '../../activity/ActivityTimeline';
import { ErrorSnackbar } from '../../snackbar/ErrorSnackbar';
import {
  GetActivityData,
  GetActivityVariables,
  HomeViewActivityProps,
  HomeViewActivityState,
} from './HomeViewActivity.types';

const getActivityQuery = gql`
  query getActivity($page: Int!, $rowsPerPage: Int!) {
    viewer {
      activityEntries(page: $page, rowsPerPage: $rowsPerPage) {
        edges {
          node {
            id
            kind
            title
            description
            createdOn
            createdBy {
              name
              username
              imageUrl
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export const HomeViewActivity = ({}: HomeViewActivityProps) => {
  const [state, setState] = useState<HomeViewActivityState>({
    activityEntries: [],
    page: 0,
    rowsPerPage: 20,
    message: null,
  });

  const variables: GetActivityVariables = { page: state.page, rowsPerPage: state.rowsPerPage };
  const { data, error } = useQuery<GetActivityData, GetActivityVariables>(getActivityQuery, { variables });
  useEffect(() => {
    if (data) {
      const newActivityEntries = data.viewer.activityEntries.edges.map((edge) => edge.node);
      setState((prevState) => ({
        ...prevState,
        activityEntries: [...prevState.activityEntries, ...newActivityEntries],
      }));
    }
    if (error) {
      setState((prevState) => ({ ...prevState, message: error.message }));
    }
  }, [data, error]);

  const handleLoadMore = () => setState((prevState) => ({ ...prevState, page: prevState.page + 1 }));

  const handleCloseSnackbar = () => setState((prevState) => ({ ...prevState, message: null }));

  const hasNext = data?.viewer.activityEntries.pageInfo.hasNextPage ?? false;
  return (
    <>
      <div>
        <Typography variant="h6">Activity</Typography>
        <ActivityTimeline activityEntries={state.activityEntries} />
        {hasNext ? <Link onClick={handleLoadMore}>Load more</Link> : null}
      </div>
      <ErrorSnackbar open={state.message !== null} message={state.message} onClose={handleCloseSnackbar} />
    </>
  );
};
