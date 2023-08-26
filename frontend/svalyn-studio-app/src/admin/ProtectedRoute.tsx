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
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { NotFoundView } from '../notfound/NotFoundView';
import { GetViewerData, GetViewerVariables, ProtectedRouteProps } from './ProtectedRoute.types';

const getViewerQuery = gql`
  query getViewer {
    viewer {
      name
      username
      imageUrl
      role
    }
  }
`;

export const ProtectedRoute = ({ children, expectedRole }: ProtectedRouteProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const { data, error } = useQuery<GetViewerData, GetViewerVariables>(getViewerQuery);
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [error]);

  if (data) {
    if (data.viewer) {
      const isAllowed = data.viewer.role === 'ADMIN' || (data.viewer.role === 'USER' && expectedRole === 'USER');
      if (isAllowed) {
        return <div>{children}</div>;
      } else {
        return <NotFoundView />;
      }
    }
  }
  return null;
};
