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
import { Palette } from './Palette';
import { PaletteContext } from './PaletteContext';
import { PaletteContextValue } from './PaletteContext.types';
import { PaletteProviderProps, PaletteProviderState } from './PaletteProvider.types';

export const PaletteProvider = ({ children }: PaletteProviderProps) => {
  const [state, setState] = useState<PaletteProviderState>({ open: false });

  useEffect(() => {
    const keyDownEventListener = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
        setState((prevState) => ({ ...prevState, open: !prevState.open }));
      } else if (event.key === 'Esc') {
        setState((prevState) => ({ ...prevState, open: false }));
      }
    };

    document.addEventListener('keydown', keyDownEventListener);
    return () => document.removeEventListener('keydown', keyDownEventListener);
  }, []);

  const handleClose = () => setState((prevState) => ({ ...prevState, open: false }));

  const paletteContextValue: PaletteContextValue = {
    openPalette: () => setState((prevState) => ({ ...prevState, open: true })),
  };

  return (
    <PaletteContext.Provider value={paletteContextValue}>
      {children}
      {state.open ? <Palette open={state.open} onClose={handleClose} /> : null}
    </PaletteContext.Provider>
  );
};
