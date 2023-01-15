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

package com.svalyn.studio.application.listeners.history;

import com.svalyn.studio.domain.history.Branch;
import com.svalyn.studio.domain.history.repositories.IBranchRepository;
import com.svalyn.studio.domain.project.events.ProjectCreatedEvent;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

/**
 * Used to initialize the history of the project.
 *
 * @author sbegaudeau
 */
@Service
public class ProjectBranchInitializer {

    private final IBranchRepository branchRepository;

    public ProjectBranchInitializer(IBranchRepository branchRepository) {
        this.branchRepository = Objects.requireNonNull(branchRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onProjectCreatedEvent(ProjectCreatedEvent event) {
        var branch = Branch.newBranch()
                .name("main")
                .project(AggregateReference.to(event.project().getId()))
                .build();
        this.branchRepository.save(branch);
    }
}
