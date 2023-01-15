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

package com.svalyn.studio.domain.resource;

import com.svalyn.studio.AbstractIntegrationTests;
import com.svalyn.studio.DomainEvents;
import com.svalyn.studio.WithMockPrincipal;
import com.svalyn.studio.domain.history.ChangeResource;
import com.svalyn.studio.domain.history.events.ChangeDeletedEvent;
import com.svalyn.studio.domain.history.repositories.IChangeRepository;
import com.svalyn.studio.domain.resource.events.ResourceDeletedEvent;
import com.svalyn.studio.domain.resource.repositories.IResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.jdbc.core.mapping.AggregateReference;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests of the change deleted event listener.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class ChangeDeletedEventListenerIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private IChangeRepository changeRepository;

    @Autowired
    private IResourceRepository resourceRepository;

    @Autowired
    private DomainEvents domainEvents;

    @BeforeEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given a change proposal, when deleted, then the related change and resources are deleted")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    @Sql(scripts = {"/scripts/cleanup.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD, config = @SqlConfig(transactionMode = SqlConfig.TransactionMode.ISOLATED))
    public void givenChangeProposal_whenDeleted_thenTheRelatedChangeIsDeleted() {
        var optionalChange = this.changeRepository.findById(UUID.fromString("aa20af7d-6159-4383-9e21-9eb377f1e6e8"));
        assertThat(optionalChange).isPresent();
        var change = optionalChange.get();

        var resourceId = change.getChangeResources().stream()
                .findFirst()
                .map(ChangeResource::getResource)
                .map(AggregateReference::getId)
                .get();
        assertThat(this.resourceRepository.existsById(resourceId)).isTrue();

        change.dispose();
        this.changeRepository.delete(change);

        TestTransaction.flagForCommit();
        TestTransaction.end();

        assertThat(this.changeRepository.existsById(change.getId())).isFalse();
        assertThat(this.resourceRepository.existsById(resourceId)).isFalse();
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeDeletedEvent.class::isInstance).count()).isEqualTo(1);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ResourceDeletedEvent.class::isInstance).count()).isEqualTo(1);
    }
}
