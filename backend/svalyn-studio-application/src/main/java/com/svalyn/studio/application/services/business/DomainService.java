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

package com.svalyn.studio.application.services.business;

import com.svalyn.studio.application.controllers.business.dto.AttributeDTO;
import com.svalyn.studio.application.controllers.business.dto.AttributeInput;
import com.svalyn.studio.application.controllers.business.dto.CreateDomainInput;
import com.svalyn.studio.application.controllers.business.dto.CreateDomainSuccessPayload;
import com.svalyn.studio.application.controllers.business.dto.DataTypeDTO;
import com.svalyn.studio.application.controllers.business.dto.DataTypeInput;
import com.svalyn.studio.application.controllers.business.dto.DomainDTO;
import com.svalyn.studio.application.controllers.business.dto.EntityDTO;
import com.svalyn.studio.application.controllers.business.dto.EntityInput;
import com.svalyn.studio.application.controllers.business.dto.EnumerationDTO;
import com.svalyn.studio.application.controllers.business.dto.EnumerationInput;
import com.svalyn.studio.application.controllers.business.dto.EnumerationLiteralDTO;
import com.svalyn.studio.application.controllers.business.dto.EnumerationLiteralInput;
import com.svalyn.studio.application.controllers.business.dto.RelationDTO;
import com.svalyn.studio.application.controllers.business.dto.RelationInput;
import com.svalyn.studio.application.controllers.dto.ErrorPayload;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.services.business.api.IDomainService;
import com.svalyn.studio.domain.Failure;
import com.svalyn.studio.domain.Success;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.business.Domain;
import com.svalyn.studio.domain.business.repositories.IDomainRepository;
import com.svalyn.studio.domain.business.services.NewAttribute;
import com.svalyn.studio.domain.business.services.NewDataType;
import com.svalyn.studio.domain.business.services.NewDomain;
import com.svalyn.studio.domain.business.services.NewEntity;
import com.svalyn.studio.domain.business.services.NewEnumeration;
import com.svalyn.studio.domain.business.services.NewEnumerationLiteral;
import com.svalyn.studio.domain.business.services.NewRelation;
import com.svalyn.studio.domain.business.services.api.IDomainCreationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

/**
 * Used to manipulate domains.
 *
 * @author sbegaudeau
 */
@Service
public class DomainService implements IDomainService {

    private final IAccountRepository accountRepository;

    private final IDomainRepository domainRepository;

    private final IDomainCreationService domainCreationService;

    public DomainService(IAccountRepository accountRepository, IDomainRepository domainRepository, IDomainCreationService domainCreationService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.domainRepository = Objects.requireNonNull(domainRepository);
        this.domainCreationService = Objects.requireNonNull(domainCreationService);
    }

    private Optional<DomainDTO> toDTO(Domain domain) {
        var entities = domain.getEntities().stream()
                .map(entity -> {
                    var attributes = entity.getAttributes().stream()
                            .map(attribute -> new AttributeDTO(attribute.getName(), attribute.getDocumentation(), attribute.getType(), attribute.isId(), attribute.isMany()))
                            .toList();

                    var relations = entity.getRelations().stream()
                            .map(relation -> new RelationDTO(relation.getName(), relation.getDocumentation(), relation.getType(), relation.isContainment(), relation.isMany()))
                            .toList();

                    return new EntityDTO(entity.getName(), entity.getDocumentation(), entity.getExtendedEntity(), entity.isAbstract(), attributes, relations);
                })
                .toList();

        var dataTypes = domain.getDataTypes().stream()
                .map(dataType -> new DataTypeDTO(dataType.getName(), dataType.getDocumentation()))
                .toList();

        var enumerations = domain.getEnumerations().stream()
                .map(enumeration -> {
                    var literals = enumeration.getLiterals().stream()
                            .map(literal -> new EnumerationLiteralDTO(literal.getName(), literal.getDocumentation()))
                            .toList();
                    return new EnumerationDTO(enumeration.getName(), enumeration.getDocumentation(), literals);
                })
                .toList();

        var domainDTO = new DomainDTO(domain.getIdentifier(), domain.getVersion(), domain.getLabel(), domain.getDocumentation(), entities, dataTypes, enumerations);
        return Optional.of(domainDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DomainDTO> findByIdentifier(String identifier) {
        return this.domainRepository.findByIdentifier(identifier).flatMap(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DomainDTO> findAll(int page, int rowsPerPage) {
        var domains = this.domainRepository.findAll(page * rowsPerPage, rowsPerPage).stream()
                .flatMap(domain -> this.toDTO(domain).stream())
                .toList();
        var count = this.domainRepository.count();
        return new PageImpl<>(domains, PageRequest.of(page, rowsPerPage), count);
    }

    @Override
    @Transactional
    public IPayload createDomain(CreateDomainInput input) {
        IPayload payload = null;

        var newDomain = this.toNewDomain(input);
        var result = this.domainCreationService.createDomain(newDomain);
        if (result instanceof Failure<Domain> failure) {
            payload = new ErrorPayload(input.id(), failure.message());
        } else if (result instanceof Success<Domain> success) {
            payload = new CreateDomainSuccessPayload(input.id(), this.toDTO(success.data()).orElse(null));
        }

        return payload;
    }

    private NewDomain toNewDomain(CreateDomainInput input) {
        var newEntities = input.domain().entities().stream()
                .map(this::toNewEntity)
                .toList();

        var newDataTypes = input.domain().dataTypes().stream()
                .map(this::toNewDataType)
                .toList();

        var newEnumerations = input.domain().enumerations().stream()
                .map(this::toNewEnumeration)
                .toList();

        return new NewDomain(
                input.domain().identifier(),
                input.domain().version(),
                input.domain().label(),
                input.domain().documentation(),
                newEntities,
                newDataTypes,
                newEnumerations
        );
    }

    private NewEntity toNewEntity(EntityInput entityInput) {
        var newAttributes = entityInput.attributes().stream()
                .map(this::toNewAttribute)
                .toList();

        var newRelations = entityInput.relations().stream()
                .map(this::toNewRelation)
                .toList();

        return new NewEntity(
                entityInput.name(),
                entityInput.documentation(),
                entityInput.extendedEntity(),
                entityInput.isAbstract(),
                newAttributes,
                newRelations
        );
    }

    private NewAttribute toNewAttribute(AttributeInput attributeInput) {
        return new NewAttribute(
                attributeInput.name(),
                attributeInput.documentation(),
                attributeInput.type(),
                attributeInput.isId(),
                attributeInput.isMany()
        );
    }

    private NewRelation toNewRelation(RelationInput relationInput) {
        return new NewRelation(
                relationInput.name(),
                relationInput.documentation(),
                relationInput.type(),
                relationInput.isContainment(),
                relationInput.isMany()
        );
    }

    private NewDataType toNewDataType(DataTypeInput dataTypeInput) {
        return new NewDataType(dataTypeInput.name(), dataTypeInput.documentation());
    }

    private NewEnumeration toNewEnumeration(EnumerationInput enumerationInput) {
        var literals = enumerationInput.literals().stream()
                .map(this::toNewEnumerationLiteral)
                .toList();

        return new NewEnumeration(enumerationInput.name(), enumerationInput.documentation(), literals);
    }

    private NewEnumerationLiteral toNewEnumerationLiteral(EnumerationLiteralInput enumerationLiteralInput) {
        return new NewEnumerationLiteral(enumerationLiteralInput.name(), enumerationLiteralInput.documentation());
    }
}
