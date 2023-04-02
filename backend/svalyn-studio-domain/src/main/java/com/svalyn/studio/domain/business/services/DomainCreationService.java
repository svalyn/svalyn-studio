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
import com.svalyn.studio.domain.business.invariants.IsValidNewDomain;
import com.svalyn.studio.domain.business.repositories.IDomainRepository;
import com.svalyn.studio.domain.business.services.api.IDomainCreationService;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.stream.Collectors;

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

        var observer = new DomainCreationObserver();
        var isValidNewDomainInvariant = new IsValidNewDomain(this.domainRepository);
        isValidNewDomainInvariant.observers().add(observer);
        var isValidNewDomain = isValidNewDomainInvariant.isSatisfiedBy(newDomain);

        if (isValidNewDomain && !observer.hasObservation()) {
            var domain = this.toDomain(newDomain);
            domain = this.domainRepository.save(domain);

            result = new Success<>(domain);
        } else {
            var observation = observer.getObservation();
            result = new Failure<>(observation.message());
        }
        return result;
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
