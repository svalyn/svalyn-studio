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

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export const Svalyn = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 400 400">
      <g>
        <path d="M339.43,119.5 A161,161 0 1 0 339.43,280.5" fill="none" stroke="white" stroke-width="15" />

        <circle cx="339.43" cy="119.5" r="40" fill="white" />
        <circle cx="339.43" cy="119.5" r="35" fill="white" />

        <circle cx="200" cy="39" r="37" fill="white" />
        <circle cx="200" cy="39" r="32" fill="white" />

        <circle cx="60.57" cy="119.5" r="34" fill="white" />
        <circle cx="60.57" cy="119.5" r="29" fill="white" />

        <circle cx="60.57" cy="280.5" r="31" fill="white" />
        <circle cx="60.57" cy="280.5" r="26" fill="white" />

        <circle cx="200" cy="361" r="28" fill="white" />
        <circle cx="200" cy="361" r="23" fill="white" />

        <circle cx="339.43" cy="280.5" r="25" fill="white" />
        <circle cx="339.43" cy="280.5" r="20" fill="white" />

        <text
          x="50%"
          y="50%"
          font-size="180"
          fill="white"
          text-anchor="middle"
          alignment-baseline="central"
          font-family="Arial"
        >
          S
        </text>
      </g>
    </SvgIcon>
  );
};
