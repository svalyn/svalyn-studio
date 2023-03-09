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

package com.svalyn.studio.domain.business.services;

import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.IResult;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.business.Attribute;
import com.svalyn.studio.domain.business.DataType;
import com.svalyn.studio.domain.business.Domain;
import com.svalyn.studio.domain.business.Entity;
import com.svalyn.studio.domain.business.Enumeration;
import com.svalyn.studio.domain.business.EnumerationLiteral;
import com.svalyn.studio.domain.business.Relation;
import com.svalyn.studio.domain.business.repositories.IDomainRepository;
import com.svalyn.studio.domain.business.services.api.IDomainCreationService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Used to create domains.
 *
 * @author sbegaudeau
 */
@Service
public class DomainCreationService implements IDomainCreationService {

    private final IDomainRepository domainRepository;

    public DomainCreationService(IDomainRepository domainRepository) {
        this.domainRepository = Objects.requireNonNull(domainRepository);
    }

    @Override
    public IResult<Domain> createDomain(NewDomain newDomain) {
        IResult<Domain> result;
        if (this.isValid(newDomain)) {
            var domain = this.toDomain(newDomain);
            domain = this.domainRepository.save(domain);

            result = new Success<>(domain);
        } else {
            result = new Failure<>("The domain is not valid");
        }
        return result;
    }

    private boolean isValid(NewDomain newDomain) {
        boolean isValid = true;
        isValid = isValid && this.isValidIdentifier(newDomain.identifier());
        isValid = isValid && !this.domainRepository.existsByIdentifier(newDomain.identifier());
        isValid = isValid && this.hasNoDuplicateNamedElements(newDomain);
        isValid = isValid && newDomain.entities().stream().allMatch(newEntity -> this.isValid(newDomain, newEntity));
        isValid = isValid && newDomain.dataTypes().stream().allMatch(this::isValid);
        isValid = isValid && newDomain.enumerations().stream().allMatch(this::isValid);
        return isValid;
    }

    private boolean hasNoDuplicateNamedElements(NewDomain newDomain) {
        var entityNameStream = newDomain.entities().stream().map(NewEntity::name);
        var dataTypeNameStream = newDomain.dataTypes().stream().map(NewDataType::name);
        var enumerationNameStream = newDomain.enumerations().stream().map(NewEnumeration::name);

        var distinctElementCount = Stream.concat(Stream.concat(entityNameStream, dataTypeNameStream), enumerationNameStream).distinct().count();
        var elementCount = newDomain.entities().size() + newDomain.dataTypes().size() + newDomain.enumerations().size();
        return distinctElementCount == elementCount;
    }

    private boolean isValid(NewDomain newDomain, NewEntity newEntity) {
        boolean isValid = true;
        isValid = isValid && this.isValidName(newEntity.name());
        isValid = isValid && Optional.ofNullable(newEntity.extendedEntity()).map(type -> this.isValidRelationTypeReference(newDomain, type)).orElse(true);
        isValid = isValid && newEntity.attributes().stream().allMatch(newAttribute -> this.isValid(newDomain, newAttribute));
        isValid = isValid && newEntity.relations().stream().allMatch(newRelation -> this.isValid(newDomain, newRelation));
        isValid = isValid && newEntity.attributes().stream().filter(NewAttribute::isId).count() <= 1;

        var featureNameStream = Stream.concat(
                newEntity.attributes().stream().map(NewAttribute::name),
                newEntity.relations().stream().map(NewRelation::name)
        );
        isValid = isValid && featureNameStream.distinct().count() == (newEntity.attributes().size() + newEntity.relations().size());

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

    private boolean isValid(NewDataType newDataType) {
        boolean isValid = true;
        isValid = isValid && this.isValidName(newDataType.name());
        return isValid;
    }

    private boolean isValid(NewEnumeration newEnumeration) {
        boolean isValid = true;
        isValid = isValid && this.isValidName(newEnumeration.name());
        isValid = isValid && newEnumeration.literals().stream().map(NewEnumerationLiteral::name).allMatch(this::isValidName);
        isValid = isValid && newEnumeration.literals().stream().map(NewEnumerationLiteral::name).distinct().count() == newEnumeration.literals().size();
        return isValid;
    }

    private boolean isValidIdentifier(String identifier) {
        return identifier.chars().mapToObj(c -> (char) c).allMatch(Character::isLetterOrDigit);
    }

    private boolean isValidName(String name) {
        return name.chars().mapToObj(c -> (char) c).allMatch(Character::isLetterOrDigit);
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

        return isValid;
    }

    private Domain toDomain(NewDomain newDomain) {
        var entities = newDomain.entities().stream()
                .map(this::toEntity)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        var dataTypes = newDomain.dataTypes().stream()
                .map(this::toDataType)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        var enumerations = newDomain.enumerations().stream()
                .map(this::toEnumeration)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return Domain.newDomain()
                .identifier(newDomain.identifier())
                .version(newDomain.version())
                .label(newDomain.label())
                .documentation(newDomain.documentation())
                .entities(entities)
                .dataTypes(dataTypes)
                .enumeration(enumerations)
                .build();
    }

    private Entity toEntity(NewEntity newEntity) {
        var attributes = newEntity.attributes().stream()
                .map(this::toAttribute)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        var relations = newEntity.relations().stream()
                .map(this::toRelation)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return Entity.newEntity()
                .name(newEntity.name())
                .documentation(newEntity.documentation())
                .extendedEntity(newEntity.extendedEntity())
                .isAbstract(newEntity.isAbstract())
                .attributes(attributes)
                .relations(relations)
                .build();
    }

    private Attribute toAttribute(NewAttribute newAttribute) {
        return Attribute.newAttribute()
                .name(newAttribute.name())
                .documentation(newAttribute.documentation())
                .type(newAttribute.type())
                .isId(newAttribute.isId())
                .isMany(newAttribute.isMany())
                .build();
    }

    private Relation toRelation(NewRelation newRelation) {
        return Relation.newRelation()
                .name(newRelation.name())
                .documentation(newRelation.documentation())
                .type(newRelation.type())
                .isContainment(newRelation.isContainment())
                .isMany(newRelation.isMany())
                .build();
    }

    private DataType toDataType(NewDataType newDataType) {
        return DataType.newDataType()
                .name(newDataType.name())
                .documentation(newDataType.documentation())
                .build();
    }

    private Enumeration toEnumeration(NewEnumeration newEnumeration) {
        var literals = newEnumeration.literals().stream()
                .map(this::toEnumerationLiteral)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return Enumeration.newEnumeration()
                .name(newEnumeration.name())
                .documentation(newEnumeration.documentation())
                .literals(literals)
                .build();
    }

    private EnumerationLiteral toEnumerationLiteral(NewEnumerationLiteral newEnumerationLiteral) {
        return EnumerationLiteral.newEnumerationLiteral()
                .name(newEnumerationLiteral.name())
                .documentation(newEnumerationLiteral.documentation())
                .build();
    }
}
