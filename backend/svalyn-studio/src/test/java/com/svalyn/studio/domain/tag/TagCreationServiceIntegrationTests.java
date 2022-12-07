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

package com.svalyn.studio.domain.tag;

import com.svalyn.studio.AbstractIntegrationTests;
import com.svalyn.studio.DomainEvents;
import com.svalyn.studio.WithMockPrincipal;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.tag.events.TagAddedToOrganizationEvent;
import com.svalyn.studio.domain.tag.events.TagAddedToProjectEvent;
import com.svalyn.studio.domain.tag.events.TagCreatedEvent;
import com.svalyn.studio.domain.tag.repositories.ITagRepository;
import com.svalyn.studio.domain.tag.services.api.ITagCreationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests of the tag creation service.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class TagCreationServiceIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private ITagRepository tagRepository;

    @Autowired
    private ITagCreationService tagCreationService;

    @Autowired
    private DomainEvents domainEvents;

    @BeforeEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given an organization, when a tag is added, then some events are published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenOrganization_whenTagAdded_thenEventsArePublished() {
        assertThat(this.tagRepository.findByKeyAndValue("tag-key", "tag-value")).isEmpty();

        var result = this.tagCreationService.addOrganizationTag("mockorganization", "tag-key", "tag-value");
        assertThat(result).isInstanceOf(Success.class);

        assertThat(this.tagRepository.findByKeyAndValue("tag-key", "tag-value")).isPresent();

        assertThat(this.domainEvents.getDomainEvents().stream().filter(TagCreatedEvent.class::isInstance).count()).isEqualTo(1);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(TagAddedToOrganizationEvent.class::isInstance).count()).isEqualTo(1);
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given a project, when a tag is added, then some events are published")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenProject_whenTagAdded_thenEventsArePublished() {
        assertThat(this.tagRepository.findByKeyAndValue("tag-key", "tag-value")).isEmpty();

        var result = this.tagCreationService.addProjectTag("mockproject", "tag-key", "tag-value");
        assertThat(result).isInstanceOf(Success.class);

        assertThat(this.tagRepository.findByKeyAndValue("tag-key", "tag-value")).isPresent();

        assertThat(this.domainEvents.getDomainEvents().stream().filter(TagCreatedEvent.class::isInstance).count()).isEqualTo(1);
        assertThat(this.domainEvents.getDomainEvents().stream().filter(TagAddedToProjectEvent.class::isInstance).count()).isEqualTo(1);
    }

}
