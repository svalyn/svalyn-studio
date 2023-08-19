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

package com.svalyn.studio.domain;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.AbstractAggregateRoot;

import java.util.stream.Collectors;

/**
 * Used to validate all the domain events sent to the abstract aggregate root.
 *
 * @param <A> The type of the aggregate root
 *
 * @author sbegaudeau
 */
public class AbstractValidatingAggregateRoot<A extends AbstractValidatingAggregateRoot<A>> extends AbstractAggregateRoot<A> {

    @Transient
    private final Logger logger = LoggerFactory.getLogger(AbstractValidatingAggregateRoot.class);

    @Override
    protected <T> T registerEvent(T event) {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var violations = validator.validate(event);
            if (!violations.isEmpty()) {
                var message = violations.stream()
                        .map(constraintViolation -> constraintViolation.getPropertyPath().toString() + " " + constraintViolation.getMessage())
                        .collect(Collectors.joining(", "));

                var exception = new ConstraintViolationException(message, violations);
                logger.warn(exception.getMessage(), exception);

                throw exception;
            }
        }

        return super.registerEvent(event);
    }
}
