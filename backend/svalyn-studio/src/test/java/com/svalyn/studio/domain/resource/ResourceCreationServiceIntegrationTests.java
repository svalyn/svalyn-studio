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
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.resource.events.ResourceCreatedEvent;
import com.svalyn.studio.domain.resource.services.api.IResourceCreationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests of the resource creation service.
 *
 * @author sbegaudeau
 */
@SpringBootTest
@Transactional
@SuppressWarnings("checkstyle:MethodName")
public class ResourceCreationServiceIntegrationTests extends AbstractIntegrationTests {

    @Autowired
    private IResourceCreationService resourceCreationService;

    @Autowired
    private DomainEvents domainEvents;

    @AfterEach
    public void cleanup() {
        this.domainEvents.clear();
    }

    @Test
    @WithMockPrincipal(userId = WithMockPrincipal.UserId.JOHN_DOE)
    @DisplayName("Given some resources, when they are persisted, then their id are initialized")
    @Sql(scripts = {"/scripts/initialize.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    public void givenResources_whenPersisted_thenHaveAnId() {
        Map<String, byte[]> resourceDescriptions = new HashMap<>();
        resourceDescriptions.put("first", "first".getBytes(StandardCharsets.UTF_8));
        resourceDescriptions.put("second", "second".getBytes(StandardCharsets.UTF_8));
        resourceDescriptions.put("third", "third".getBytes(StandardCharsets.UTF_8));

        var result = this.resourceCreationService.createResources(resourceDescriptions);
        assertThat(result).isInstanceOf(Success.class);

        if (result instanceof Success<List<Resource>> success) {
            for (var resource: success.data()) {
                assertThat(resource.getId()).isNotNull();
            }
        }

        assertThat(this.domainEvents.getDomainEvents().stream().filter(ResourceCreatedEvent.class::isInstance).count()).isEqualTo(3);
    }

}
