/*
 * Copyright (c) 2023 Stéphane Bégaudeau.
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

package com.svalyn.studio.domain.business.invariants;

import com.svalyn.studio.domain.business.services.NewEnumeration;
import com.svalyn.studio.domain.business.services.NewEnumerationLiteral;
import com.svalyn.studio.domain.invariant.IInvariant;
import com.svalyn.studio.domain.observe.AbstractObservable;
import com.svalyn.studio.domain.observe.Observation;

/**
 * Invariant used to validate a new enumeration.
 *
 * @author sbegaudeau
 */
public class IsValidNewEnumeration extends AbstractObservable implements IInvariant<NewEnumeration> {

    @Override
    public boolean isSatisfiedBy(NewEnumeration newEnumeration) {
        boolean isValid = true;
        isValid = isValid && this.isValidName(newEnumeration.name());
        isValid = isValid && this.hasValidEnumerationLiteral(newEnumeration);
        return isValid;
    }

    private boolean isValidName(String name) {
        var isValid = name.chars().mapToObj(c -> (char) c).allMatch(Character::isLetterOrDigit);
        if (!isValid) {
            this.emit(new Observation("Invalid name for the enumeration"));
        }
        return isValid;
    }

    private boolean hasValidEnumerationLiteral(NewEnumeration newEnumeration) {
        boolean hasValidLiterals = newEnumeration.literals().stream().map(NewEnumerationLiteral::name).allMatch(this::isValidName);
        if (!hasValidLiterals) {
            this.emit(new Observation("Invalid name for an enumeration literal"));
        }

        boolean hasDistinctLiterals = newEnumeration.literals().stream().map(NewEnumerationLiteral::name).distinct().count() == newEnumeration.literals().size();
        if (!hasDistinctLiterals) {
            this.emit(new Observation("Duplicate enumeration literal"));
        }

        return hasValidLiterals && hasDistinctLiterals;
    }
}
