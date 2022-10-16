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
import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;

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
}
