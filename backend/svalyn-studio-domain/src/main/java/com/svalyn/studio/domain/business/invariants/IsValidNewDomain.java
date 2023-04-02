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

import com.svalyn.studio.domain.business.repositories.IDomainRepository;
import com.svalyn.studio.domain.business.services.NewDataType;
import com.svalyn.studio.domain.business.services.NewDomain;
import com.svalyn.studio.domain.business.services.NewEntity;
import com.svalyn.studio.domain.business.services.NewEnumeration;
import com.svalyn.studio.domain.invariant.IInvariant;
import com.svalyn.studio.domain.observe.AbstractObservable;
import com.svalyn.studio.domain.observe.Observation;

import java.util.Objects;
import java.util.stream.Stream;

/**
 * Invariant used to determine if a new domain is valid.
 *
 * @author sbegaudeau
 */
public class IsValidNewDomain extends AbstractObservable implements IInvariant<NewDomain> {

    private final IDomainRepository domainRepository;

    public IsValidNewDomain(IDomainRepository domainRepository) {
        this.domainRepository = Objects.requireNonNull(domainRepository);
    }

    @Override
    public boolean isSatisfiedBy(NewDomain newDomain) {
        boolean isValid = true;
        isValid = isValid && this.isValidIdentifier(newDomain.identifier());
        isValid = isValid && this.doesNotAlreadyExist(newDomain.identifier());
        isValid = isValid && this.hasNoDuplicateNamedElements(newDomain);

        isValid = isValid && newDomain.entities().stream()
                .map(newEntity -> {
                    var invariant = new IsValidNewEntity(domainRepository, newDomain);
                    invariant.observers().addAll(this.observers());
                    return invariant.isSatisfiedBy(newEntity);
                })
                .reduce(Boolean.TRUE, Boolean::logicalAnd);

        isValid = isValid && newDomain.dataTypes().stream()
                .map(newDataType -> {
                    var invariant = new IsValidNewDataType();
                    invariant.observers().addAll(this.observers());
                    return invariant.isSatisfiedBy(newDataType);
                })
                .reduce(Boolean.TRUE, Boolean::logicalAnd);

        isValid = isValid && newDomain.enumerations().stream()
                .map(newEnumeration -> {
                    var invariant = new IsValidNewEnumeration();
                    invariant.observers().addAll(this.observers());
                    return invariant.isSatisfiedBy(newEnumeration);
                })
                .reduce(Boolean.TRUE, Boolean::logicalAnd);

        return isValid;
    }

    private boolean isValidIdentifier(String identifier) {
        var isValid =  identifier.chars().mapToObj(c -> (char) c).allMatch(Character::isLetterOrDigit);
        if (!isValid) {
            this.emit(new Observation("Invalid identifier for the domain"));
        }
        return isValid;
    }

    private boolean doesNotAlreadyExist(String identifier) {
        var domainAlreadyExists = this.domainRepository.existsByIdentifier(identifier);
        if (domainAlreadyExists) {
            this.emit(new Observation("A domain with this identifier already exists"));
        }
        return !domainAlreadyExists;
    }

    private boolean hasNoDuplicateNamedElements(NewDomain newDomain) {
        var entityNameStream = newDomain.entities().stream().map(NewEntity::name);
        var dataTypeNameStream = newDomain.dataTypes().stream().map(NewDataType::name);
        var enumerationNameStream = newDomain.enumerations().stream().map(NewEnumeration::name);

        var distinctElementCount = Stream.concat(Stream.concat(entityNameStream, dataTypeNameStream), enumerationNameStream).distinct().count();
        var elementCount = newDomain.entities().size() + newDomain.dataTypes().size() + newDomain.enumerations().size();
        var hasDuplicateNamedElements =  distinctElementCount != elementCount;

        if (hasDuplicateNamedElements) {
            this.emit(new Observation("There are multiple child elements with the same name"));
        }

        return !hasDuplicateNamedElements;
    }
}
