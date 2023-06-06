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
import com.svalyn.studio.domain.business.Domain;
import com.svalyn.studio.domain.business.repositories.IDomainRepository;
import com.svalyn.studio.domain.business.services.api.IDomainCreationService;
import org.eclipse.emf.common.util.Diagnostic;
import org.eclipse.emf.ecore.util.Diagnostician;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Used to create domains.
 *
 * @author sbegaudeau
 */
@Service
public class DomainCreationService implements IDomainCreationService {

    private final IDomainRepository domainRepository;

    private final Diagnostician diagnostician;

    public DomainCreationService(IDomainRepository domainRepository, Diagnostician diagnostician) {
        this.domainRepository = Objects.requireNonNull(domainRepository);
        this.diagnostician = Objects.requireNonNull(diagnostician);
    }

    @Override
    public IResult<Domain> createDomain(EPackageRegistration ePackageRegistration) {
        IResult<Domain> result;

        var alreadyExists = this.domainRepository.existsByIdentifier(ePackageRegistration.ePackage().getName());
        var diagnostic = this.diagnostician.validate(ePackageRegistration.ePackage());
        if (alreadyExists) {
            result = new Failure<>("The domain already exists");
        } else if (diagnostic.getSeverity() != Diagnostic.OK && diagnostic.getSeverity() != Diagnostic.INFO) {
            result = new Failure<>(diagnostic.getMessage());
        } else {
            var domain = this.toDomain(ePackageRegistration);
            domain = this.domainRepository.save(domain);
            result = new Success<>(domain);
        }

        return result;
    }

    private Domain toDomain(EPackageRegistration ePackageRegistration) {
        return Domain.newDomain()
                .identifier(ePackageRegistration.ePackage().getName())
                .version(ePackageRegistration.version())
                .label(ePackageRegistration.label())
                .documentation(ePackageRegistration.documentation())
                .build();
    }
}
