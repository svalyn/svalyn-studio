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

package com.svalyn.studio.architecture;

import com.svalyn.studio.application.controllers.dto.IInput;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.domain.AbstractValidatingAggregateRoot;
import com.svalyn.studio.domain.IDomainEvent;
import com.tngtech.archunit.core.domain.JavaMethod;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.AbstractAggregateRoot;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;

import jakarta.validation.Valid;

import java.util.Arrays;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;

/**
 * Architecture tests used to validate contraint in our code.
 *
 * @author sbegaudeau
 */
@SuppressWarnings("checkstyle:MethodName")
public class ArchitectureTests {
    @Test
    @DisplayName("Given a record, when used as an input, then it should implement IInput")
    public void givenRecord_whenUsedAsInput_thenItShouldImplementIInput() {
        var classes = new ClassFileImporter().importPackages("com.svalyn.studio");
        var rule = classes()
                .that().areRecords()
                .and().haveSimpleNameEndingWith("Input")
                .should().implement(IInput.class);
        rule.check(classes);
    }

    @Test
    @DisplayName("Given a record, when used as a payload, then it should implement IPayload")
    public void givenRecord_whenUsedAsPayload_thenItShouldImplementIPayload() {
        var classes = new ClassFileImporter().importPackages("com.svalyn.studio");
        var rule = classes()
                .that().areRecords()
                .and().haveSimpleNameEndingWith("Payload")
                .should().implement(IPayload.class);
        rule.check(classes);
    }

    @Test
    @DisplayName("Given a controller, when a method is annotated with @SchemaMapping, then it should not be using a standard type name (Query, Mutation or Subscription)")
    public void givenController_whenAnnotatedWithSchemaMapping_thenShouldNotUseStandardTypeName() {
        var classes = new ClassFileImporter().importPackages("com.svalyn.studio.application");

        ArchCondition<? super JavaMethod> notUseSchemaMappingAsStandardAnnotationMapping = new ArchCondition<JavaMethod>("Not use schema mapping as a standard annotation mapping") {
            @Override
            public void check(JavaMethod method, ConditionEvents events) {
                var annotationsAreValid = Arrays.stream(method.reflect().getAnnotations())
                        .filter(SchemaMapping.class::isInstance)
                        .map(SchemaMapping.class::cast)
                        .allMatch(schemaMapping -> !schemaMapping.typeName().equals("Query")
                                && !schemaMapping.typeName().equals("Mutation")
                                && !schemaMapping.typeName().equals("Subscription"));
                var message = String.format("The method %s is using @SchemaMapping instead of @QueryMapping, @MutationMapping or @SubscriptionMapping", method.getFullName());
                events.add(new SimpleConditionEvent(method, annotationsAreValid, message));
            }
        };

        var rule = methods()
                .that().areAnnotatedWith(SchemaMapping.class)
                .and().areNotAnnotatedWith(QueryMapping.class)
                .and().areNotAnnotatedWith(MutationMapping.class)
                .and().areNotAnnotatedWith(SubscriptionMapping.class)
                .should(notUseSchemaMappingAsStandardAnnotationMapping);

        rule.check(classes);
    }

    @Test
    @DisplayName("Given a controller, when a method is used as a mutation, then its parameter should be annotated with @Valid")
    public void givenController_whenMutation_thenAnnotatedWithValid() {
        var classes = new ClassFileImporter().importPackages("com.svalyn.studio.application");
        ArchCondition<? super JavaMethod> haveParametersAnnotatedWithValid = new ArchCondition<JavaMethod>("Have parameters annotated with @Valid") {
            @Override
            public void check(JavaMethod method, ConditionEvents events) {
                var parametersValid  = method.getParameters().stream()
                        .filter(parameter -> parameter.isAnnotatedWith(Argument.class))
                        .allMatch(parameter -> parameter.isAnnotatedWith(Valid.class));
                var message = String.format("All parameters of %s annotated with @Argument should be annotated with @Valid", method.getFullName());
                events.add(new SimpleConditionEvent(method, parametersValid, message));
            }
        };

        var rule = methods()
                .that().areAnnotatedWith(MutationMapping.class)
                .should(haveParametersAnnotatedWithValid);
        rule.check(classes);
    }

    @Test
    @DisplayName("Given an aggregate root, when extending AbstractAggregateRoot, then it should extend AbstractValidatingAggregateRoot")
    public void givenAnAggregateRoot_whenExtendingAbstractAggregateRoot_thenShouldExtendAbstractValidatingAggregateRoot() {
        var classes = new ClassFileImporter().importPackages("com.svalyn.studio.domain");

        var rule = classes()
                .that().areAssignableTo(AbstractAggregateRoot.class)
                .should().beAssignableTo(AbstractValidatingAggregateRoot.class);
        rule.check(classes);
    }

    @Test
    @DisplayName("Given a record, when named XxxEvent, then it should implement IDomainEvent")
    public void givenRecord_whenNamedEvent_thenShouldImplementDomainEvent() {
        var classes = new ClassFileImporter().importPackages("com.svalyn.studio.domain");

        var rule = classes()
                .that().haveSimpleNameEndingWith("Event")
                .should().beAssignableTo(IDomainEvent.class);
        rule.check(classes);
    }
}
