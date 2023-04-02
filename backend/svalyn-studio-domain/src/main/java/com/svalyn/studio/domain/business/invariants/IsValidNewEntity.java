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

import com.svalyn.studio.domain.business.DataType;
import com.svalyn.studio.domain.business.Entity;
import com.svalyn.studio.domain.business.Enumeration;
import com.svalyn.studio.domain.business.repositories.IDomainRepository;
import com.svalyn.studio.domain.business.services.NewAttribute;
import com.svalyn.studio.domain.business.services.NewDataType;
import com.svalyn.studio.domain.business.services.NewDomain;
import com.svalyn.studio.domain.business.services.NewEntity;
import com.svalyn.studio.domain.business.services.NewEnumeration;
import com.svalyn.studio.domain.business.services.NewRelation;
import com.svalyn.studio.domain.invariant.IInvariant;
import com.svalyn.studio.domain.observe.AbstractObservable;
import com.svalyn.studio.domain.observe.Observation;

import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * Invariant used to validate new entities.
 *
 * @author sbegaudeau
 */
public class IsValidNewEntity extends AbstractObservable implements IInvariant<NewEntity> {

    private final IDomainRepository domainRepository;

    private final NewDomain newDomain;

    public IsValidNewEntity(IDomainRepository domainRepository, NewDomain newDomain) {
        this.domainRepository = Objects.requireNonNull(domainRepository);
        this.newDomain = Objects.requireNonNull(newDomain);
    }

    @Override
    public boolean isSatisfiedBy(NewEntity newEntity) {
        boolean isValid = true;
        isValid = isValid && this.isValidName(newEntity.name());
        isValid = isValid && Optional.ofNullable(newEntity.extendedEntity()).map(type -> this.isValidRelationTypeReference(this.newDomain, type)).orElse(true);
        isValid = isValid && newEntity.attributes().stream().allMatch(newAttribute -> this.isValid(this.newDomain, newAttribute));
        isValid = isValid && newEntity.relations().stream().allMatch(newRelation -> this.isValid(this.newDomain, newRelation));
        isValid = isValid && newEntity.attributes().stream().filter(NewAttribute::isId).count() <= 1;

        var featureNameStream = Stream.concat(
                newEntity.attributes().stream().map(NewAttribute::name),
                newEntity.relations().stream().map(NewRelation::name)
        );
        isValid = isValid && featureNameStream.distinct().count() == (newEntity.attributes().size() + newEntity.relations().size());

        return isValid;
    }

    private boolean isValidName(String name) {
        var isValid = name.chars().mapToObj(c -> (char) c).allMatch(Character::isLetterOrDigit);
        if (!isValid) {
            this.emit(new Observation("Invalid name"));
        }
        return isValid;
    }

    private boolean isValidIdentifier(String identifier) {
        var isValid = identifier.chars().mapToObj(c -> (char) c).allMatch(Character::isLetterOrDigit);
        if (!isValid) {
            this.emit(new Observation("Invalid identifier"));
        }
        return isValid;
    }

    private boolean isValid(NewDomain newDomain, NewAttribute newAttribute) {
        boolean isValid = true;
        isValid = isValid && this.isValidName(newAttribute.name());
        isValid = isValid && Optional.ofNullable(newAttribute.type()).map(type -> this.isValidAttributeTypeReference(newDomain, type)).orElse(true);
        return isValid;
    }

    private boolean isValid(NewDomain newDomain, NewRelation newRelation) {
        boolean isValid = true;
        isValid = isValid && this.isValidName(newRelation.name());
        isValid = isValid && Optional.ofNullable(newRelation.type()).map(type -> this.isValidRelationTypeReference(newDomain, type)).orElse(true);
        return isValid;
    }

    private boolean isValidAttributeTypeReference(NewDomain newDomain, String type) {
        boolean isValid = true;
        var index = type.indexOf("::");
        isValid = isValid && index != -1;

        if (isValid) {
            var domainIdentifier = type.substring(0, index);
            var typeName = type.substring(index + "::".length());

            isValid = isValid && this.isValidIdentifier(domainIdentifier);
            isValid = isValid && this.isValidName(typeName);

            if (isValid) {
                if (domainIdentifier.equals(newDomain.identifier())) {
                    var hasMatchingDataType = newDomain.dataTypes().stream().map(NewDataType::name).anyMatch(typeName::equals);
                    var hasMatchingEnumeration = newDomain.enumerations().stream().map(NewEnumeration::name).anyMatch(typeName::equals);
                    isValid = isValid && (hasMatchingDataType || hasMatchingEnumeration);
                } else {
                    isValid = isValid && this.domainRepository.findByIdentifier(domainIdentifier).map(domain -> {
                        var hasMatchingDataType = domain.getDataTypes().stream().map(DataType::getName).anyMatch(typeName::equals);
                        var hasMatchingEnumeration = domain.getEnumerations().stream().map(Enumeration::getName).anyMatch(typeName::equals);
                        return hasMatchingDataType || hasMatchingEnumeration;
                    }).orElse(false);
                }
            }
        }

        if (!isValid) {
            this.emit(new Observation("Invalid attribute type"));
        }

        return isValid;
    }

    private boolean isValidRelationTypeReference(NewDomain newDomain, String type) {
        boolean isValid = true;
        var index = type.indexOf("::");
        isValid = isValid && index != -1;

        if (isValid) {
            var domainIdentifier = type.substring(0, index);
            var typeName = type.substring(index + "::".length());

            isValid = isValid && this.isValidIdentifier(domainIdentifier);
            isValid = isValid && this.isValidName(typeName);

            if (isValid) {
                if (domainIdentifier.equals(newDomain.identifier())) {
                    isValid = isValid && newDomain.entities().stream().map(NewEntity::name).anyMatch(typeName::equals);
                } else {
                    isValid = isValid && this.domainRepository.findByIdentifier(domainIdentifier)
                            .map(domain -> domain.getEntities().stream()
                                    .map(Entity::getName)
                                    .anyMatch(typeName::equals))
                            .orElse(false);
                }
            }
        }

        if (!isValid) {
            this.emit(new Observation("Invalid relation type"));
        }

        return isValid;
    }
}
