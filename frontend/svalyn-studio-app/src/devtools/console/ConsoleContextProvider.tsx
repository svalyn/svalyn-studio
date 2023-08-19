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

import React, { useState } from 'react';
import { Message } from '../../snackbar/ErrorSnackbar.types';
import {
  ConsoleContextProviderProps,
  ConsoleContextProviderState,
  ConsoleContextValue,
} from './ConsoleContextProvider.types';

export const ConsoleContext = React.createContext<ConsoleContextValue>({
  messages: [],
  pushMessage: () => {},
  clearMessages: () => {},
});

export const ConsoleContextProvider = ({ children }: ConsoleContextProviderProps) => {
  const [state, setState] = useState<ConsoleContextProviderState>({
    messages: [],
  });

  const pushMessage = (message: Message) =>
    setState((prevState) => ({ ...prevState, messages: [...prevState.messages, message] }));

  const clearMessages = () => setState((prevState) => ({ ...prevState, messages: [] }));

  const value: ConsoleContextValue = {
    messages: [...state.messages],
    pushMessage,
    clearMessages,
  };

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
};
