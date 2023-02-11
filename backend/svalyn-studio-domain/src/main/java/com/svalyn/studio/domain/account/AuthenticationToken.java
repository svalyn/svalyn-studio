/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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

package com.svalyn.studio.domain.account;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to store the authentication token of the account.
 *
 * @author sbegaudeau
 */
@Table(name = "authentication_token")
public class AuthenticationToken {

    @Id
    private UUID id;

    private String name;

    private String accessKey;

    private String secretKey;

    private AuthenticationTokenStatus status;

    private Instant createdOn;

    private Instant lastModifiedOn;

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAccessKey() {
        return accessKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public AuthenticationTokenStatus getStatus() {
        return status;
    }

    public Instant getCreatedOn() {
        return createdOn;
    }

    public Instant getLastModifiedOn() {
        return lastModifiedOn;
    }

    public void updateStatus(AuthenticationTokenStatus status) {
        this.status = status;
        this.lastModifiedOn = Instant.now();
    }

    public static Builder newTokenCredentials() {
        return new Builder();
    }

    /**
     * The builder used to create new token credentials.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private String name;

        private String accessKey;

        private String secretKey;

        public Builder name(String name) {
            this.name = Objects.requireNonNull(name);
            return this;
        }

        public Builder accessKey(String accessKey) {
            this.accessKey = Objects.requireNonNull(accessKey);
            return this;
        }

        public Builder secretKey(String secretKey) {
            this.secretKey = Objects.requireNonNull(secretKey);
            return this;
        }

        public AuthenticationToken build() {
            var tokenCredentials = new AuthenticationToken();

            tokenCredentials.name = Objects.requireNonNull(name);
            tokenCredentials.accessKey = Objects.requireNonNull(accessKey);
            tokenCredentials.secretKey = Objects.requireNonNull(secretKey);
            tokenCredentials.status = AuthenticationTokenStatus.ACTIVE;

            var now = Instant.now();
            tokenCredentials.createdOn = now;
            tokenCredentials.lastModifiedOn = now;

            return tokenCredentials;
        }
    }
}
