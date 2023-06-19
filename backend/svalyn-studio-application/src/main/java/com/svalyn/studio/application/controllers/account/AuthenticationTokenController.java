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

package com.svalyn.studio.application.controllers.account;

import com.svalyn.studio.application.controllers.account.dto.AuthenticationTokenDTO;
import com.svalyn.studio.application.controllers.account.dto.CreateAuthenticationTokenInput;
import com.svalyn.studio.application.controllers.account.dto.UpdateAuthenticationTokensStatusInput;
import com.svalyn.studio.application.controllers.dto.IPayload;
import com.svalyn.studio.application.controllers.dto.PageInfoWithCount;
import com.svalyn.studio.application.services.account.api.IAuthenticationTokenService;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultConnectionCursor;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;
import graphql.relay.Relay;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.Objects;

/**
 * Controller used to manipulate authentication tokens.
 *
 * @author sbegaudeau
 */
@Controller
public class AuthenticationTokenController {

    private final IAuthenticationTokenService authenticationTokenService;

    public AuthenticationTokenController(IAuthenticationTokenService authenticationTokenService) {
        this.authenticationTokenService = Objects.requireNonNull(authenticationTokenService);
    }

    @SchemaMapping(typeName = "Viewer")
    public Connection<AuthenticationTokenDTO> authenticationTokens(@Argument int page, @Argument int rowsPerPage) {
        var pageData = this.authenticationTokenService.findAll(page, rowsPerPage);
        var edges = pageData.stream().map(authenticationToken -> {
            var value = new Relay().toGlobalId("AuthenticationToken", authenticationToken.id().toString());
            var cursor = new DefaultConnectionCursor(value);
            return (Edge<AuthenticationTokenDTO>) new DefaultEdge<>(authenticationToken, cursor);
        }).toList();
        var pageInfo = new PageInfoWithCount(null, null, pageData.hasPrevious(), pageData.hasNext(), pageData.getTotalElements());
        return new DefaultConnection<>(edges, pageInfo);
    }

    @MutationMapping
    public IPayload createAuthenticationToken(@Argument @Valid CreateAuthenticationTokenInput input) {
        return this.authenticationTokenService.createAuthenticationToken(input);
    }

    @MutationMapping
    public IPayload updateAuthenticationTokensStatus(@Argument @Valid UpdateAuthenticationTokensStatusInput input) {
        return this.authenticationTokenService.updateAuthenticationTokensStatus(input);
    }
}
