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

import { blueGrey, purple } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

import SourceSansProRegular from '../fonts/SourceSansPro-Regular.ttf';

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f4f6f8',
    },
    done: {
      main: purple[600],
      light: purple[600],
      dark: purple[600],
    },
    code: {
      main: blueGrey[900],
      light: blueGrey[900],
      dark: blueGrey[900],
    },
  },
  typography: {
    fontFamily: 'Source Sans Pro, Helvetica Neue, Helvetica, Arial, sans-serif',
    t5: {
      fontFamily: '-apple-system,"system-ui",BlinkMacSystemFont,"SF Mono",Monaco,Menlo,Courier,monospace,sans-serif',
      fontSize: '11px',
      fontWeight: '400',
      lineHeight: '35px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    },
    t6: {
      fontFamily: '-apple-system,"system-ui",BlinkMacSystemFont,"SF Mono",Monaco,Menlo,Courier,monospace,sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      lineHeight: '22px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    },
    tbody: {
      fontFamily: '-apple-system,"system-ui",BlinkMacSystemFont,"SF Mono",Monaco,Menlo,Courier,monospace,sans-serif',
      fontSize: '13px',
      lineHeight: '22px',
      whiteSpace: 'pre',
    },
    tbody2: {
      fontFamily: '-apple-system,"system-ui",BlinkMacSystemFont,"SF Mono",Monaco,Menlo,Courier,monospace,sans-serif',
      fontSize: '13px',
      lineHeight: '35px',
      whiteSpace: 'pre',
    },
    tcontent: {
      fontFamily: 'Menlo, Monaco, "Courier New", monospace, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '12px',
      lineHeight: '22px',
      fontWeight: '400',
      tabSize: '4',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Source Sans Pro';
          font-style: 'normal';
          font-weight: 400;
          font-display: swap;
          src: url(${SourceSansProRegular})
        }
      `,
    },
    MuiAppBar: {
      styleOverrides: {
        root: `box-shadow: none;`,
      },
    },
  },
});

declare module '@mui/material/styles' {
  interface Palette {
    done: Palette['primary'];
    code: Palette['primary'];
  }

  interface PaletteOptions {
    done: PaletteOptions['primary'];
    code: PaletteOptions['primary'];
  }

  interface TypographyVariants {
    t5: React.CSSProperties;
    t6: React.CSSProperties;
    tbody: React.CSSProperties;
    tbody2: React.CSSProperties;
    tcontent: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    t5?: React.CSSProperties;
    t6?: React.CSSProperties;
    tbody?: React.CSSProperties;
    tbody2?: React.CSSProperties;
    tcontent?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    t5: true;
    t6: true;
    tbody: true;
    tbody2: true;
    tcontent: true;
  }
}
