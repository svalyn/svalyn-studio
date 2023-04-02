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

package com.svalyn.studio.infrastructure.initialization;

import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.AccountRole;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.domain.business.services.NewAttribute;
import com.svalyn.studio.domain.business.services.NewDataType;
import com.svalyn.studio.domain.business.services.NewDomain;
import com.svalyn.studio.domain.business.services.NewEntity;
import com.svalyn.studio.domain.business.services.NewRelation;
import com.svalyn.studio.domain.business.services.api.IDomainCreationService;
import com.svalyn.studio.infrastructure.security.SvalynSystemUser;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Used to register the default domains.
 *
 * @author sbegaudeau
 */
@Service
public class Initializer implements CommandLineRunner {

    private final IAccountRepository accountRepository;

    private final IDomainCreationService domainCreationService;

    public Initializer(IAccountRepository accountRepository, IDomainCreationService domainCreationService) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.domainCreationService = Objects.requireNonNull(domainCreationService);
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        var systemAccount = this.accountRepository.findByUsername("system").orElseGet(() -> {
            var account = Account.newAccount()
                    .role(AccountRole.ADMIN)
                    .username("system")
                    .name("System")
                    .email("system@svalyn.com")
                    .imageUrl("")
                    .build();
            return this.accountRepository.save(account);
        });

        var authentication = SecurityContextHolder.getContext().getAuthentication();

        var systemAuthentication = new UsernamePasswordAuthenticationToken(new SvalynSystemUser(systemAccount.getId()), "", List.of());
        SecurityContextHolder.getContext().setAuthentication(systemAuthentication);
        this.domainCreationService.createDomain(this.coreDomain());

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private NewDomain coreDomain() {
        List<NewEntity> entities = new ArrayList<>();
        entities.add(this.domain());
        entities.add(this.entity());
        entities.add(this.attribute());
        entities.add(this.relation());
        entities.add(this.dataType());
        entities.add(this.enumeration());
        entities.add(this.enumerationLiteral());

        var dataTypes = List.of(
                new NewDataType("String", ""),
                new NewDataType("Boolean", ""),
                new NewDataType("Integer", "")
        );
        return new NewDomain("core", "2023.5.0", "Core", "The Core domain is the parent of every domains", entities, dataTypes, List.of());
    }

    private NewEntity domain() {
        var identifierAttribute = new NewAttribute("identifier", "", "core::String", false, false);
        var versionAttribute = new NewAttribute("version", "", "core::String", false, false);
        var labelAttribute = new NewAttribute("label", "", "core::String", false, false);
        var documentationAttribute = new NewAttribute("documentation", "", "core::String", false, false);
        var attributes = List.of(identifierAttribute, versionAttribute, labelAttribute, documentationAttribute);

        var entitiesRelation = new NewRelation("entities", "", "core::Entity", true, true);
        var dataTypesRelation = new NewRelation("dataTypes", "", "core::DataType", true, true);
        var enumerationsRelation = new NewRelation("enumerations", "", "core::Enumeration", true, true);
        var relations = List.of(entitiesRelation, dataTypesRelation, enumerationsRelation);

        return new NewEntity("Domain", "", null, false, attributes, relations);
    }

    private NewEntity entity() {
        var nameAttribute = new NewAttribute("name", "", "core::String", false, false);
        var documentationAttribute = new NewAttribute("documentation", "", "core::String", false, false);
        var extendedEntityAttribute = new NewAttribute("extendedEntity", "", "core::String", false, false);
        var isAbstractAttribute = new NewAttribute("isAbstract", "", "core::Boolean", false, false);
        var attributes = List.of(nameAttribute, documentationAttribute, extendedEntityAttribute, isAbstractAttribute);

        var attributesRelation = new NewRelation("attributes", "", "core::Attribute", true, true);
        var relationsRelation = new NewRelation("relations", "", "core::Relation", true, true);
        var relations = List.of(attributesRelation, relationsRelation);

        return new NewEntity("Entity", "", null, false, attributes, relations);
    }

    private NewEntity attribute() {
        var nameAttribute = new NewAttribute("name", "", "core::String", false, false);
        var documentationAttribute = new NewAttribute("documentation", "", "core::String", false, false);
        var typeAttribute = new NewAttribute("type", "", "core::String", false, false);
        var isIdAttribute = new NewAttribute("isId", "", "core::Boolean", false, false);
        var isManyAttribute = new NewAttribute("isMany", "", "core::Boolean", false, false);
        var attributes = List.of(nameAttribute, documentationAttribute, typeAttribute, isIdAttribute, isManyAttribute);

        return new NewEntity("Attribute", "", null, false, attributes, List.of());
    }

    private NewEntity relation() {
        var nameAttribute = new NewAttribute("name", "", "core::String", false, false);
        var documentationAttribute = new NewAttribute("documentation", "", "core::String", false, false);
        var typeAttribute = new NewAttribute("type", "", "core::String", false, false);
        var isContainmentAttribute = new NewAttribute("isContainment", "", "core::Boolean", false, false);
        var isManyAttribute = new NewAttribute("isMany", "", "core::Boolean", false, false);
        var attributes = List.of(nameAttribute, documentationAttribute, typeAttribute, isContainmentAttribute, isManyAttribute);

        return new NewEntity("Relation", "", null, false, attributes, List.of());
    }

    private NewEntity dataType() {
        var nameAttribute = new NewAttribute("name", "", "core::String", false, false);
        var documentationAttribute = new NewAttribute("documentation", "", "core::String", false, false);
        var attributes = List.of(nameAttribute, documentationAttribute);

        return new NewEntity("DataType", "", null, false, attributes, List.of());
    }

    private NewEntity enumeration() {
        var nameAttribute = new NewAttribute("name", "", "core::String", false, false);
        var documentationAttribute = new NewAttribute("documentation", "", "core::String", false, false);
        var attributes = List.of(nameAttribute, documentationAttribute);

        var literalsRelation = new NewRelation("literals", "", "core::EnumerationLiteral", true, true);
        var relations = List.of(literalsRelation);

        return new NewEntity("Enumeration", "", null, false, attributes, relations);
    }

    private NewEntity enumerationLiteral() {
        var nameAttribute = new NewAttribute("name", "", "core::String", false, false);
        var documentationAttribute = new NewAttribute("documentation", "", "core::String", false, false);
        var attributes = List.of(nameAttribute, documentationAttribute);

        return new NewEntity("EnumerationLiteral", "", null, false, attributes, List.of());
    }
}
