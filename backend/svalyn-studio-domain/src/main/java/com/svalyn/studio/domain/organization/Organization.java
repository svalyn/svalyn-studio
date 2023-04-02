/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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
package com.svalyn.studio.domain.organization;

import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.authentication.ProfileProvider;
import com.svalyn.studio.domain.authentication.UserIdProvider;
import com.svalyn.studio.domain.organization.events.InvitationAcceptedEvent;
import com.svalyn.studio.domain.organization.events.InvitationDeclinedEvent;
import com.svalyn.studio.domain.organization.events.InvitationRevokedEvent;
import com.svalyn.studio.domain.organization.events.MemberInvitedEvent;
import com.svalyn.studio.domain.organization.events.MemberLeftEvent;
import com.svalyn.studio.domain.organization.events.MembershipRevokedEvent;
import com.svalyn.studio.domain.organization.events.OrganizationCreatedEvent;
import com.svalyn.studio.domain.organization.events.OrganizationDeletedEvent;
import com.svalyn.studio.domain.organization.events.OrganizationModifiedEvent;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.MappedCollection;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * The aggregate root of the organization domain.
 *
 * It is used to organize users and their work.
 *
 * @author sbegaudeau
 */
@Table("organization")
public class Organization extends AbstractValidatingAggregateRoot<Organization> implements Persistable<UUID> {

    @Transient
    private boolean isNew;

    @Id
    private UUID id;

    private String identifier;

    private String name;

    @MappedCollection(idColumn = "organization_id")
    private Set<Invitation> invitations = new LinkedHashSet<>();

    @MappedCollection(idColumn = "organization_id")
    private Set<Membership> memberships = new LinkedHashSet<>();

    @Column("created_by")
    private AggregateReference<Account, UUID> createdBy;

    private Instant createdOn;

    @Column("last_modified_by")
    private AggregateReference<Account, UUID> lastModifiedBy;

    private Instant lastModifiedOn;

    public UUID getId() {
        return id;
    }

    public String getIdentifier() {
        return identifier;
    }

    public String getName() {
        return name;
    }

    public Set<Invitation> getInvitations() {
        return invitations;
    }

    public Set<Membership> getMemberships() {
        return memberships;
    }

    public AggregateReference<Account, UUID> getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public AggregateReference<Account, UUID> getLastModifiedBy() {
        return lastModifiedBy;
    }

    public Instant getLastModifiedOn() {
        return lastModifiedOn;
    }

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public void updateName(String name) {
        this.name = Objects.requireNonNull(name);
        this.lastModifiedBy = UserIdProvider.get();
        this.lastModifiedOn = Instant.now();

        var createdBy = ProfileProvider.get();
        this.registerEvent(new OrganizationModifiedEvent(UUID.randomUUID(), this.lastModifiedOn, createdBy, this));
    }

    public void inviteMember(UUID memberId) {
        var invitation = Invitation.newInvitation()
                .memberId(AggregateReference.to(memberId))
                .build();
        this.invitations.add(invitation);

        var createdBy = ProfileProvider.get();
        this.registerEvent(new MemberInvitedEvent(UUID.randomUUID(), Instant.now(), createdBy, this, invitation));
    }

    public void acceptInvitation(UUID invitationId) {
        var optionalInvitation = this.invitations.stream()
                .filter(invitation -> invitation.getId().equals(invitationId))
                .findFirst();
        if (optionalInvitation.isPresent()) {
            Invitation invitation = optionalInvitation.get();
            this.invitations.remove(invitation);

            var membership = Membership.newMembership()
                    .memberId(invitation.getMemberId())
                    .role(MembershipRole.MEMBER)
                    .build();
            this.memberships.add(membership);

            var createdBy = ProfileProvider.get();
            this.registerEvent(new InvitationAcceptedEvent(UUID.randomUUID(), Instant.now(), createdBy, this, invitation));
        }
    }

    public void declineInvitation(UUID invitationId) {
        var optionalInvitation = this.invitations.stream()
                .filter(invitation -> invitation.getId().equals(invitationId))
                .findFirst();
        if (optionalInvitation.isPresent()) {
            Invitation invitation = optionalInvitation.get();
            this.invitations.remove(invitation);

            var createdBy = ProfileProvider.get();
            this.registerEvent(new InvitationDeclinedEvent(UUID.randomUUID(), Instant.now(), createdBy, this, invitation));
        }
    }

    public void revokeInvitation(UUID invitationId) {
        var optionalInvitation = this.invitations.stream()
                .filter(invitation -> invitation.getId().equals(invitationId))
                .findFirst();
        if (optionalInvitation.isPresent()) {
            Invitation invitation = optionalInvitation.get();
            this.invitations.remove(invitation);

            var createdBy = ProfileProvider.get();
            this.registerEvent(new InvitationRevokedEvent(UUID.randomUUID(), Instant.now(), createdBy, this, invitation));
        }
    }

    public void revokeMemberships(List<UUID> membershipIds) {
        var createdBy = ProfileProvider.get();

        this.memberships.stream()
                .filter(membership -> membershipIds.contains(membership.getId()))
                .forEach(membership -> {
                    this.memberships.remove(membership);
                    this.registerEvent(new MembershipRevokedEvent(UUID.randomUUID(), Instant.now(), createdBy, this, membership));
                });
    }

    public void leave(UUID memberId) {
        var createdBy = ProfileProvider.get();

        this.memberships.stream()
                .filter(membership -> membership.getMemberId().getId().equals(memberId))
                .findFirst()
                .ifPresent(membership -> {
                    this.memberships.remove(membership);
                    this.registerEvent(new MemberLeftEvent(UUID.randomUUID(), Instant.now(), createdBy, this));
                });
    }

    public void dispose() {
        var createdBy = ProfileProvider.get();
        this.registerEvent(new OrganizationDeletedEvent(UUID.randomUUID(), Instant.now(), createdBy, this));
    }

    public static Builder newOrganization() {
        return new Builder();
    }

    /**
     * The builder used to create new organizations.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private String identifier;

        private String name;

        private List<AggregateReference<Account, UUID>> members;

        private Builder() {
            // Prevent instantiation
        }

        public Builder identifier(String identifier) {
            this.identifier = Objects.requireNonNull(identifier);
            return this;
        }

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder initialMembers(List<AggregateReference<Account, UUID>> members) {
            this.members = Objects.requireNonNull(members);
            return this;
        }

        public Organization build() {
            var organization = new Organization();
            organization.isNew = true;
            organization.id = UUID.randomUUID();
            organization.identifier = Objects.requireNonNull(identifier);
            organization.name = Objects.requireNonNull(this.name);
            organization.memberships = this.members.stream()
                    .map(accountId -> Membership.newMembership()
                            .memberId(accountId)
                            .role(MembershipRole.ADMIN)
                            .build()
                    )
                    .collect(Collectors.toSet());

            var now = Instant.now();
            var userId = UserIdProvider.get();
            organization.createdBy = userId;
            organization.createdOn = now;
            organization.lastModifiedBy = userId;
            organization.lastModifiedOn = now;

            var createdBy = ProfileProvider.get();
            organization.registerEvent(new OrganizationCreatedEvent(UUID.randomUUID(), now, createdBy, organization));
            return organization;
        }
    }
}
