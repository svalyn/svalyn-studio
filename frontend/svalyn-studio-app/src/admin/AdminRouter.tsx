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

import { Route, Routes } from 'react-router-dom';
import { AdminAccountsView } from './AdminAccountsView';
import { AdminHomeView } from './AdminHomeView';
import { AdminNewAccountView } from './AdminNewAccountView';
import { AdminShell } from './AdminShell';
import { ProtectedRoute } from './ProtectedRoute';

export const AdminRouter = () => {
  return (
    <AdminShell>
      <ProtectedRoute expectedRole="ADMIN">
        <Routes>
          <Route index element={<AdminHomeView />} />
          <Route path="accounts" element={<AdminAccountsView />} />
          <Route path="/new/account" element={<AdminNewAccountView />} />
        </Routes>
      </ProtectedRoute>
    </AdminShell>
  );
};
