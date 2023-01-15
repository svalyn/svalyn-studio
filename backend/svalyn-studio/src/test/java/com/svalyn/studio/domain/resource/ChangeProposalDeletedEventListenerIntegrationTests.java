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

package com.svalyn.studio.domain.resource;

import com.svalyn.studio.AbstractIntegrationTests;
import com.svalyn.studio.DomainEvents;
import com.svalyn.studio.WithMockPrincipal;
import com.svalyn.studio.domain.history.events.ChangeDeletedEvent;
import com.svalyn.studio.domain.history.events.ChangeProposalDeletedEvent;
import com.svalyn.studio.domain.history.repositories.IChangeProposalRepository;
import com.svalyn.studio.domain.history.repositories.IChangeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests of the change proposal deleted event listener.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class ChangeProposalDeletedEventListenerIntegrationTests extends AbstractIntegrationTests {
    @Autowired
    private IChangeProposalRepository changeProposalRepository;

    @Autowired
    private IChangeRepository changeRepository;

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
        var optionalChangeProposal = this.changeProposalRepository.findById(UUID.fromString("60dd31a6-7e0c-47e9-af9f-b290e383822d"));
        assertThat(optionalChangeProposal).isPresent();
        var changeProposal = optionalChangeProposal.get();

        var optionalChange = this.changeRepository.findById(changeProposal.getChange().getId());
        assertThat(optionalChange).isPresent();
        var change = optionalChange.get();

        changeProposal.dispose();
        this.changeProposalRepository.delete(changeProposal);

        TestTransaction.flagForCommit();
        TestTransaction.end();

        assertThat(this.changeProposalRepository.existsById(changeProposal.getId())).isFalse();
        assertThat(this.changeRepository.existsById(changeProposal.getChange().getId())).isFalse();
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeProposalDeletedEvent.class::isInstance).count()).isEqualTo(1);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(ChangeDeletedEvent.class::isInstance).count()).isEqualTo(1);
    }
}
