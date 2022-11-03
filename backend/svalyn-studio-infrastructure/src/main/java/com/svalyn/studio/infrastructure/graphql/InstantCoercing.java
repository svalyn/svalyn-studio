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

import graphql.language.StringValue;
import graphql.schema.Coercing;
import graphql.schema.CoercingParseLiteralException;
import graphql.schema.CoercingParseValueException;
import graphql.schema.CoercingSerializeException;

import java.time.Instant;
import java.time.format.DateTimeFormatter;

/**
 * Used to support the Instant scalar.
 *
 * @author sbegaudeau
 */
public class InstantCoercing implements Coercing<Instant, String> {
    @Override
    public String serialize(Object input) throws CoercingSerializeException {
        if (input instanceof Instant) {
            Instant instant = (Instant) input;
            return DateTimeFormatter.ISO_INSTANT.format(instant);
        }
        return null;
    }

    @Override
    public Instant parseValue(Object input) throws CoercingParseValueException {
        Instant value = null;
        if (input instanceof Instant) {
            value = (Instant) input;
        } else if (input instanceof String) {
            value = Instant.parse((String) input);
        }
        return value;
    }

    @Override
    public Instant parseLiteral(Object input) throws CoercingParseLiteralException {
        if (input instanceof StringValue) {
            StringValue stringValue = (StringValue) input;
            return Instant.parse(stringValue.getValue());
        }
        return null;
    }
}
