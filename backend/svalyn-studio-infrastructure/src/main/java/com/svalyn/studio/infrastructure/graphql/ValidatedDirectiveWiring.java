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

package com.svalyn.studio.infrastructure.graphql;

import com.svalyn.studio.application.controllers.dto.IPayload;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.idl.SchemaDirectiveWiring;
import graphql.schema.idl.SchemaDirectiveWiringEnvironment;
import org.springframework.stereotype.Service;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * The support for the directive @validated.
 *
 * @author sbegaudeau
 */
@Service
public class ValidatedDirectiveWiring implements SchemaDirectiveWiring {

    private final Validator validator;

    public ValidatedDirectiveWiring(Validator validator) {
        this.validator = Objects.requireNonNull(validator);
    }

    @Override
    public GraphQLFieldDefinition onField(SchemaDirectiveWiringEnvironment<GraphQLFieldDefinition> environment) {
        var originalDataFetcher = environment.getCodeRegistry().getDataFetcher(environment.getFieldsContainer(), environment.getElement());
        var validatedDataFetcher = new DataFetcher<Object>() {
            @Override
            public Object get(DataFetchingEnvironment dataFetchingEnvironment) throws Exception {
                var result = originalDataFetcher.get(dataFetchingEnvironment);
                if (result instanceof IPayload) {
                    validate(result);
                }
                return result;
            }
        };
        environment.getCodeRegistry().dataFetcher(environment.getFieldsContainer(), environment.getElement(), validatedDataFetcher);
        return environment.getElement();
    }

    private void validate(Object object) {
        var violations = this.validator.validate(object);
        if (!violations.isEmpty()) {
            var message = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            throw new ConstraintViolationException(message, violations);
        }
    }
}
