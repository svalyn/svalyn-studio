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

package com.svalyn.studio.infrastructure.kafka;

import com.svalyn.studio.domain.IDomainEvent;
import com.svalyn.studio.domain.account.events.IAccountEvent;
import com.svalyn.studio.domain.changeproposal.events.IChangeProposalEvent;
import com.svalyn.studio.domain.organization.events.IOrganizationEvent;
import com.svalyn.studio.domain.project.events.IProjectEvent;
import com.svalyn.studio.domain.resource.events.IResourceEvent;
import com.svalyn.studio.infrastructure.kafka.converters.api.IDomainEventToMessageConverter;
import com.svalyn.studio.infrastructure.kafka.messages.Message;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Used to publish messages to the Kafka broker.
 *
 * @author sbegaudeau
 */
@Service
public class KafkaMessageProducer {

    public static final String TOPIC_LOGGING_ACCOUNT = "logging.account";

    public static final String TOPIC_LOGGING_CHANGEPROPOSAL = "logging.changeproposal";

    public static final String TOPIC_LOGGING_PROJECT = "logging.project";

    public static final String TOPIC_LOGGING_ORGANIZATION = "logging.organization";

    public static final String TOPIC_LOGGING_RESOURCE = "logging.resource";

    private final KafkaTemplate<String, Message> kafkaTemplate;

    private final List<IDomainEventToMessageConverter> domainEventToMessageConverters;

    public KafkaMessageProducer(KafkaTemplate<String, Message> kafkaTemplate, List<IDomainEventToMessageConverter> domainEventToMessageConverters) {
        this.kafkaTemplate = Objects.requireNonNull(kafkaTemplate);
        this.domainEventToMessageConverters = Objects.requireNonNull(domainEventToMessageConverters);
    }

    private Optional<Message> toMessage(IDomainEvent event) {
        return this.domainEventToMessageConverters.stream()
                .flatMap(converter -> converter.convert(event).stream())
                .findFirst();
    }

    private void publishMessage(String topic, Message message) {
        this.kafkaTemplate.send(topic, message).addCallback(new KafkaListenableFutureCallback());
    }

    @TransactionalEventListener
    public void onAccountEvent(IAccountEvent event) {
        this.toMessage(event).ifPresent(message -> this.publishMessage(TOPIC_LOGGING_ACCOUNT, message));
    }

    @TransactionalEventListener
    public void onChangeProposalEvent(IChangeProposalEvent event) {
        this.toMessage(event).ifPresent(message -> this.publishMessage(TOPIC_LOGGING_CHANGEPROPOSAL, message));
    }

    @TransactionalEventListener
    public void onProjectEvent(IProjectEvent event) {
        this.toMessage(event).ifPresent(message -> this.publishMessage(TOPIC_LOGGING_PROJECT, message));
    }

    @TransactionalEventListener
    public void onOrganizationEvent(IOrganizationEvent event) {
        this.toMessage(event).ifPresent(message -> this.publishMessage(TOPIC_LOGGING_ORGANIZATION, message));
    }

    @TransactionalEventListener
    public void onResourceEvent(IResourceEvent event) {
        this.toMessage(event).ifPresent(message -> this.publishMessage(TOPIC_LOGGING_RESOURCE, message));
    }

}
