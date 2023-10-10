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
import { ProjectProvider } from './ProjectProvider';
import { ProjectShell } from './ProjectShell';
import { ProjectActivityView } from './activity/ProjectActivityView';
import { ChangeProposalRouter } from './changeproposal/ChangeProposalRouter';
import { ProjectChangeProposalsView } from './changeproposals/ProjectChangeProposalsView';
import { ProjectHomeView } from './home/ProjectHomeView';
import { NewChangeProposalView } from './new-changeproposal/NewChangeProposalView';
import { ResourceView } from './resource/ResourceView';
import { ProjectSettingsView } from './settings/ProjectSettingsView';
import { ProjectTagsView } from './tags/ProjectTagsView';
import { WorkspaceView } from './workspace/WorkspaceView';

export const ProjectRouter = () => {
  return (
    <ProjectProvider>
      <Routes>
        <Route index element={withProjectShell(ProjectHomeView)} />
        <Route path="branches/:branchName" element={withProjectShell(ProjectHomeView)} />
        <Route path="activity" element={withProjectShell(ProjectActivityView)} />
        <Route path="changeproposals" element={withProjectShell(ProjectChangeProposalsView)} />
        <Route path="changeproposals/:changeProposalIdentifier/*" element={withProjectShell(ChangeProposalRouter)} />
        <Route path="tags" element={withProjectShell(ProjectTagsView)} />
        <Route path="settings" element={withProjectShell(ProjectSettingsView)} />
        <Route path="new/changeproposal" element={withProjectShell(NewChangeProposalView)} />
        <Route path="changes/:changeId" element={<WorkspaceView />} />
        <Route path="changes/:changeId/resources/*" element={withProjectShell(ResourceView)} />
      </Routes>
    </ProjectProvider>
  );
};

const withProjectShell = (Component: () => JSX.Element | null) => {
  return (
    <ProjectShell>
      <Component />
    </ProjectShell>
  );
};
