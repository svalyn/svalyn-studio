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

package com.svalyn.studio.domain.account;

import org.jmolecules.ddd.annotation.Entity;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Used to store the OAuth2 account information.
 *
 * @author sbegaudeau
 */
@Entity
@Table(name = "oauth2_metadata")
public class OAuth2Metadata {

    @Id
    private UUID id;

    private String provider;

    private String providerId;

    private Instant createdOn;

    private Instant lastModifiedOn;

    public String getProvider() {
        return provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public static Builder newOAuth2Metadata() {
        return new Builder();
    }

    /**
     * The builder used to create new OAuth2 metadata.
     *
     * @author sbegaudeau
     */
    public static final class Builder {
        private String provider;

        private String providerId;

        public Builder provider(String provider) {
            this.provider = Objects.requireNonNull(provider);
            return this;
        }

        public Builder providerId(String providerId) {
            this.providerId = Objects.requireNonNull(providerId);
            return this;
        }

        public OAuth2Metadata build() {
            var oAuth2Metadata = new OAuth2Metadata();

            oAuth2Metadata.provider = Objects.requireNonNull(provider);
            oAuth2Metadata.providerId = Objects.requireNonNull(providerId);

            var now = Instant.now();
            oAuth2Metadata.createdOn = now;
            oAuth2Metadata.lastModifiedOn = now;

            return oAuth2Metadata;
        }
    }
}
