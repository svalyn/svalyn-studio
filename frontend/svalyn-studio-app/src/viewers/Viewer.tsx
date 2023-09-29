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

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { IItemViewProvider } from '../workbench/api/providers/ItemProviders.types';
import { useAdapterFactory } from '../workbench/api/providers/useAdapterFactory';
import { GraphViewer } from './GraphViewer';
import { ViewerProps, ViewerState } from './Viewer.types';

export const Viewer = ({ object }: ViewerProps) => {
  const [state, setState] = useState<ViewerState>({ viewContent: null });

  const { adapterFactory } = useAdapterFactory();
  useEffect(() => {
    const itemViewProvider = adapterFactory.adapt<IItemViewProvider>(object, 'IItemViewProvider');
    if (itemViewProvider) {
      itemViewProvider
        .getContent(object)
        .then((viewContent) => setState((prevState) => ({ ...prevState, viewContent })));
    }
  }, [object]);

  let rawViewer: JSX.Element | null = null;
  if (state.viewContent) {
    if (state.viewContent.contentType === 'TEXT_PLAIN') {
      rawViewer = (
        <Box sx={{ px: (theme) => theme.spacing(2), overflow: 'scroll' }}>
          <pre>
            <Typography variant="tcontent">{state.viewContent.content}</Typography>
          </pre>
        </Box>
      );
    } else {
      rawViewer = <GraphViewer content={state.viewContent.content} />;
    }
  }
  return rawViewer;
};
