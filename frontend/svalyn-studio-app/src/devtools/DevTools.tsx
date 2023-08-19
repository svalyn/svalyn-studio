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

import { useEffect, useState } from 'react';
import { DevToolsProps, DevToolsState } from './DevTools.types';
import { DevToolsDialog } from './dialog/DevToolsDialog';

export const DevTools = ({ children }: DevToolsProps) => {
  const [state, setState] = useState<DevToolsState>({ dialogOpen: false });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'F12' && event.shiftKey) {
        setState((prevState) => ({ ...prevState, dialogOpen: true }));
      }
    };
    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  }, []);

  const handleClose = () => setState((prevState) => ({ ...prevState, dialogOpen: false }));

  return (
    <>
      <div id="devtools">{children}</div>
      <DevToolsDialog open={state.dialogOpen} onClose={handleClose} />
    </>
  );
};
