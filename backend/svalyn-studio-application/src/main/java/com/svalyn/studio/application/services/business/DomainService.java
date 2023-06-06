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
import com.svalyn.studio.application.controllers.business.dto.DataTypeDTO;
import com.svalyn.studio.application.controllers.business.dto.DomainDTO;
import com.svalyn.studio.application.controllers.business.dto.EntityDTO;
import com.svalyn.studio.application.controllers.business.dto.EnumerationDTO;
import com.svalyn.studio.application.controllers.business.dto.EnumerationLiteralDTO;
import com.svalyn.studio.application.controllers.business.dto.RelationDTO;
import com.svalyn.studio.application.services.business.api.IDomainService;
import com.svalyn.studio.domain.business.Domain;
import com.svalyn.studio.domain.business.repositories.IDomainRepository;
import com.svalyn.studio.domain.business.services.EPackageRegistration;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.emf.ecore.EDataType;
import org.eclipse.emf.ecore.EEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Used to manipulate domains.
 *
 * @author sbegaudeau
 */
@Service
public class DomainService implements IDomainService {

    private final IDomainRepository domainRepository;

    private final List<EPackageRegistration> ePackageRegistrations;

    public DomainService(IDomainRepository domainRepository, List<EPackageRegistration> ePackageRegistrations) {
        this.domainRepository = Objects.requireNonNull(domainRepository);
        this.ePackageRegistrations = Objects.requireNonNull(ePackageRegistrations);
    }

    private Optional<DomainDTO> toDTO(Domain domain) {
        return this.ePackageRegistrations.stream()
                .filter(ePackageRegistration -> ePackageRegistration.ePackage().getName().equals(domain.getIdentifier()))
                .findFirst()
                .map(this::toDomainDTO);
    }

    private DomainDTO toDomainDTO(EPackageRegistration ePackageRegistration) {
        var ePackage = ePackageRegistration.ePackage();

        var entities = ePackage.getEClassifiers().stream()
                .filter(EClass.class::isInstance)
                .map(EClass.class::cast)
                .map(eClass -> {
                    var attributes = eClass.getEAttributes().stream()
                            .map(eAttribute -> new AttributeDTO(eAttribute.getName(), "", eAttribute.getEType().getEPackage().getName() + "::" + eAttribute.getEType().getName(), eAttribute.isID(), eAttribute.isMany()))
                            .toList();

                    var relations = eClass.getEReferences().stream()
                            .map(eReference -> new RelationDTO(eReference.getName(), "", eReference.getEType().getEPackage().getName() + "::" + eReference.getEType().getName(), eReference.isContainment(), eReference.isMany()))
                            .toList();

                    var extendedEntities = eClass.getESuperTypes().stream()
                            .map(eSuperType -> eSuperType.getEPackage().getName() + "::" + eSuperType.getName())
                            .toList();

                    return new EntityDTO(eClass.getName(), "", extendedEntities, eClass.isAbstract(), attributes, relations);
                })
                .toList();

        var dataTypes = ePackage.getEClassifiers().stream()
                .filter(eClassifier -> !(eClassifier instanceof EEnum))
                .filter(EDataType.class::isInstance)
                .map(EDataType.class::cast)
                .map(eDataType -> new DataTypeDTO(eDataType.getName(), ""))
                .toList();

        var enumerations = ePackage.getEClassifiers().stream()
                .filter(EEnum.class::isInstance)
                .map(EEnum.class::cast)
                .map(eEnum -> {
                    var literals = eEnum.getELiterals().stream()
                            .map(eEnumLiteral -> new EnumerationLiteralDTO(eEnumLiteral.getName(), ""))
                            .toList();
                    return new EnumerationDTO(eEnum.getName(), "", literals);
                })
                .toList();

        return new DomainDTO(ePackage.getName(), ePackageRegistration.version(), ePackageRegistration.label(), ePackageRegistration.documentation(), entities, dataTypes, enumerations);
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
}
