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

import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import { Route, Link as RouterLink, Routes } from 'react-router-dom';
import { Navbar } from '../navbars/Navbar';
import { DomainView } from './DomainView';
import { DomainsView } from './DomainsView';

export const DomainsRouter = () => {
  return (
    <>
      <div>
        <Navbar>
          <Link component={RouterLink} to="/domains" color="inherit" underline="hover" fontWeight={800}>
            Domains
          </Link>
        </Navbar>
        <Container maxWidth="lg">
          <Toolbar />

          <Routes>
            <Route index element={<DomainsView />} />
            <Route path=":domainIdentifier" element={<DomainView />} />
          </Routes>
        </Container>
      </div>
    </>
  );
};
