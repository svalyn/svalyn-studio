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

import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import HomeIcon from '@mui/icons-material/Home';
import HubIcon from '@mui/icons-material/Hub';
import { PaletteNavigationAction } from './Palette.types';

export const goToHome: PaletteNavigationAction = {
  type: 'navigation-action',
  id: 'go-to-home',
  icon: <HomeIcon fontSize="small" />,
  label: 'Home',
  to: '/',
};

export const goToDomains: PaletteNavigationAction = {
  type: 'navigation-action',
  id: 'go-to-domains',
  icon: <HubIcon fontSize="small" />,
  label: 'Domains',
  to: '/domains',
};

export const goToNewOrganization: PaletteNavigationAction = {
  type: 'navigation-action',
  id: 'go-to-new-organization',
  icon: <CorporateFareIcon fontSize="small" />,
  label: 'New organization',
  to: '/new/organization',
};
