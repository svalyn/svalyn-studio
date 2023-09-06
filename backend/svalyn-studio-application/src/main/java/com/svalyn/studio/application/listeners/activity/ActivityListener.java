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

package com.svalyn.studio.application.listeners.activity;

import com.svalyn.studio.domain.account.events.AccountCreatedEvent;
import com.svalyn.studio.domain.activity.ActivityEntry;
import com.svalyn.studio.domain.activity.ActivityKind;
import com.svalyn.studio.domain.activity.OrganizationActivityEntry;
import com.svalyn.studio.domain.activity.ProjectActivityEntry;
import com.svalyn.studio.domain.activity.repositories.IActivityEntryRepository;
import com.svalyn.studio.domain.activity.repositories.IOrganizationActivityEntryRepository;
import com.svalyn.studio.domain.activity.repositories.IProjectActivityEntryRepository;
import com.svalyn.studio.domain.history.events.ChangeProposalCreatedEvent;
import com.svalyn.studio.domain.history.events.ChangeProposalIntegratedEvent;
import com.svalyn.studio.domain.history.events.ReviewPerformedEvent;
import com.svalyn.studio.domain.organization.events.OrganizationCreatedEvent;
import com.svalyn.studio.domain.project.events.ProjectCreatedEvent;
import com.svalyn.studio.domain.project.events.ProjectDeletedEvent;
import com.svalyn.studio.domain.project.repositories.IProjectRepository;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Objects;

/**
 * Used to track the activity.
 *
 * @author sbegaudeau
 */
@Service
public class ActivityListener {

    private final IActivityEntryRepository activityEntryRepository;

    private final IOrganizationActivityEntryRepository organizationActivityEntryRepository;

    private final IProjectActivityEntryRepository projectActivityEntryRepository;

    private final IProjectRepository projectRepository;

    public ActivityListener(IActivityEntryRepository activityEntryRepository, IOrganizationActivityEntryRepository organizationActivityEntryRepository, IProjectActivityEntryRepository projectActivityEntryRepository, IProjectRepository projectRepository) {
        this.activityEntryRepository = Objects.requireNonNull(activityEntryRepository);
        this.organizationActivityEntryRepository = Objects.requireNonNull(organizationActivityEntryRepository);
        this.projectActivityEntryRepository = Objects.requireNonNull(projectActivityEntryRepository);
        this.projectRepository = Objects.requireNonNull(projectRepository);
    }

    @Transactional
    @TransactionalEventListener
    public void onAccountCreatedEvent(AccountCreatedEvent event) {
        var activityEntry = ActivityEntry.newActivityEntry()
                .kind(ActivityKind.ACCOUNT_CREATED)
                .createdBy(AggregateReference.to(event.account().getId()))
                .title("Account created")
                .description("has created their account")
                .build();
        this.activityEntryRepository.save(activityEntry);
    }

    @Transactional
    @TransactionalEventListener
    public void onOrganizationCreatedEvent(OrganizationCreatedEvent event) {
        var activityEntry = ActivityEntry.newActivityEntry()
                .kind(ActivityKind.ORGANIZATION_CREATED)
                .title("Organization created")
                .description("has created the organization " + event.organization().getName())
                .build();
        this.activityEntryRepository.save(activityEntry);

        var organizationActivityEntry = OrganizationActivityEntry.newOrganizationActivityEntry()
                .activity(AggregateReference.to(activityEntry.getId()))
                .organization(AggregateReference.to(event.organization().getId()))
                .build();
        this.organizationActivityEntryRepository.save(organizationActivityEntry);
    }

    @Transactional
    @TransactionalEventListener
    public void onProjectCreatedEvent(ProjectCreatedEvent event) {
        var activityEntry = ActivityEntry.newActivityEntry()
                .kind(ActivityKind.PROJECT_CREATED)
                .title("Project created")
                .description("has created the project " + event.project().getName())
                .build();
        this.activityEntryRepository.save(activityEntry);

        var organizationActivityEntry = OrganizationActivityEntry.newOrganizationActivityEntry()
                .activity(AggregateReference.to(activityEntry.getId()))
                .organization(event.project().getOrganization())
                .build();
        this.organizationActivityEntryRepository.save(organizationActivityEntry);

        var projectActivityEntry = ProjectActivityEntry.newProjectActivityEntry()
                .activity(AggregateReference.to(activityEntry.getId()))
                .project(AggregateReference.to(event.project().getId()))
                .build();
        this.projectActivityEntryRepository.save(projectActivityEntry);
    }

    @Transactional
    @TransactionalEventListener
    public void onProjectDeletedEvent(ProjectDeletedEvent event) {
        var activityEntry = ActivityEntry.newActivityEntry()
                .kind(ActivityKind.PROJECT_DELETED)
                .title("Project deleted")
                .description("has deleted the project " + event.project().getName())
                .build();
        this.activityEntryRepository.save(activityEntry);

        var organizationActivityEntry = OrganizationActivityEntry.newOrganizationActivityEntry()
                .activity(AggregateReference.to(activityEntry.getId()))
                .organization(event.project().getOrganization())
                .build();
        this.organizationActivityEntryRepository.save(organizationActivityEntry);
    }

    @Transactional
    @TransactionalEventListener
    public void onChangeProposalCreatedEvent(ChangeProposalCreatedEvent event) {
        var activityEntry = ActivityEntry.newActivityEntry()
                .kind(ActivityKind.CHANGE_PROPOSAL_CREATED)
                .title("Change proposal created")
                .description("has created a new change proposal \"" + event.changeProposal().getName() + "\"")
                .build();
        this.activityEntryRepository.save(activityEntry);

        var projectActivityEntry = ProjectActivityEntry.newProjectActivityEntry()
                .activity(AggregateReference.to(activityEntry.getId()))
                .project(event.changeProposal().getProject())
                .build();
        this.projectActivityEntryRepository.save(projectActivityEntry);

        this.projectRepository.findById(event.changeProposal().getProject().getId()).ifPresent(project -> {
            var organizationActivityEntry = OrganizationActivityEntry.newOrganizationActivityEntry()
                    .activity(AggregateReference.to(activityEntry.getId()))
                    .organization(project.getOrganization())
                    .build();
            this.organizationActivityEntryRepository.save(organizationActivityEntry);
        });
    }

    @Transactional
    @TransactionalEventListener
    public void onReviewPerformedEvent(ReviewPerformedEvent event) {
        var activityEntry = ActivityEntry.newActivityEntry()
                .kind(ActivityKind.CHANGE_PROPOSAL_REVIEWED)
                .title("Change proposal reviewed")
                .description("has reviewed the change proposal \"" + event.changeProposal().getName() + "\"")
                .build();
        this.activityEntryRepository.save(activityEntry);

        var projectActivityEntry = ProjectActivityEntry.newProjectActivityEntry()
                .activity(AggregateReference.to(activityEntry.getId()))
                .project(event.changeProposal().getProject())
                .build();
        this.projectActivityEntryRepository.save(projectActivityEntry);

        this.projectRepository.findById(event.changeProposal().getProject().getId()).ifPresent(project -> {
            var organizationActivityEntry = OrganizationActivityEntry.newOrganizationActivityEntry()
                    .activity(AggregateReference.to(activityEntry.getId()))
                    .organization(project.getOrganization())
                    .build();
            this.organizationActivityEntryRepository.save(organizationActivityEntry);
        });
    }

    @Transactional
    @TransactionalEventListener
    public void onChangeProposalIntegratedEvent(ChangeProposalIntegratedEvent event) {
        var activityEntry = ActivityEntry.newActivityEntry()
                .kind(ActivityKind.CHANGE_PROPOSAL_INTEGRATED)
                .title("Change proposal integrated")
                .description("has integrated the change proposal \"" + event.changeProposal().getName() + "\"")
                .build();
        this.activityEntryRepository.save(activityEntry);

        var projectActivityEntry = ProjectActivityEntry.newProjectActivityEntry()
                .activity(AggregateReference.to(activityEntry.getId()))
                .project(event.changeProposal().getProject())
                .build();
        this.projectActivityEntryRepository.save(projectActivityEntry);

        this.projectRepository.findById(event.changeProposal().getProject().getId()).ifPresent(project -> {
            var organizationActivityEntry = OrganizationActivityEntry.newOrganizationActivityEntry()
                    .activity(AggregateReference.to(activityEntry.getId()))
                    .organization(project.getOrganization())
                    .build();
            this.organizationActivityEntryRepository.save(organizationActivityEntry);
        });
    }
}
