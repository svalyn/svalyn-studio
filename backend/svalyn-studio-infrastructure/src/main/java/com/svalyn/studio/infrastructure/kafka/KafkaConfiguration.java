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

import com.svalyn.studio.message.Message;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Configuration of the Kafka broker.
 *
 * @author sbegaudeau
 */
@Configuration
public class KafkaConfiguration {

    private final String bootstrapServer;

    public KafkaConfiguration(@Value("${spring.kafka.producer.bootstrap-servers}") String bootstrapServer) {
        this.bootstrapServer = Objects.requireNonNull(bootstrapServer);
    }

    @Bean
    public NewTopic loggingAccount() {
        return TopicBuilder.name(KafkaMessageProducer.TOPIC_EVENT_ACCOUNT).build();
    }

    @Bean
    public NewTopic loggingChangeProposal() {
        return TopicBuilder.name(KafkaMessageProducer.TOPIC_EVENT_HISTORY).build();
    }

    @Bean
    public NewTopic loggingProject() {
        return TopicBuilder.name(KafkaMessageProducer.TOPIC_EVENT_PROJECT).build();
    }

    @Bean
    public NewTopic loggingOrganization() {
        return TopicBuilder.name(KafkaMessageProducer.TOPIC_EVENT_ORGANIZATION).build();
    }

    @Bean
    public NewTopic loggingResource() {
        return TopicBuilder.name(KafkaMessageProducer.TOPIC_EVENT_RESOURCE).build();
    }

    @Bean
    public ProducerFactory<String, Message> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServer);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Message> kafkaTemplate() {
        return new KafkaTemplate<>(this.producerFactory());
    }
}
