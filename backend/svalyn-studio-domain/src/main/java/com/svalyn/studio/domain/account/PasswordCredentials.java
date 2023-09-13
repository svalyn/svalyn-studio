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
 * Used to store the password of the account.
 *
 * @author sbegaudeau
 */
@Entity
@Table(name = "password_credentials")
public class PasswordCredentials {

    @Id
    private UUID id;

    private String password;

    private boolean active;

    private Instant createdOn;

    private Instant lastModifiedOn;

    public String getPassword() {
        return password;
    }

    public boolean isActive() {
        return active;
    }

    public static Builder newPasswordCredentials() {
        return new Builder();
    }

    /**
     * The builder used to create new password credentials.
     *
     * @author sbegaudeau
     */
    public static final class Builder {

        private String password;

        public Builder password(String password) {
            this.password = Objects.requireNonNull(password);
            return this;
        }

        public PasswordCredentials build() {
            var passwordCredentials = new PasswordCredentials();

            passwordCredentials.password = Objects.requireNonNull(this.password);
            passwordCredentials.active = true;

            var now = Instant.now();
            passwordCredentials.createdOn = now;
            passwordCredentials.lastModifiedOn = now;

            return passwordCredentials;
        }
    }
}
