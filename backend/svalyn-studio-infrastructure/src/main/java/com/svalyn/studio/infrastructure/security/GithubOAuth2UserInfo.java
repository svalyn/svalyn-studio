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
package com.svalyn.studio.infrastructure.security;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * The user info retrieved from the Github oauth2 API.
 *
 * @author sbegaudeau
 */
public class GithubOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    private final List<Map<String, Object>> additionalData;

    public GithubOAuth2UserInfo(Map<String, Object> attributes, List<Map<String, Object>> additionalData) {
        this.attributes = Objects.requireNonNull(attributes);
        this.additionalData = Objects.requireNonNull(additionalData);
    }

    @Override
    public String getId() {
        return Optional.ofNullable(this.attributes.get("id")).map(Object::toString).orElse("");
    }

    @Override
    public String getName() {
        return Optional.ofNullable(this.attributes.get("name")).map(Object::toString).orElse("");
    }

    @Override
    public String getEmail() {
        String email = "";
        var optionalPublicEmail = Optional.ofNullable(this.attributes.get("email")).map(Object::toString);
        if (optionalPublicEmail.isEmpty()) {
            var optionalVerifiedPrimaryEmail = this.additionalData.stream()
                    .filter(data -> Boolean.TRUE.equals(data.get("verified")))
                    .filter(data -> Boolean.TRUE.equals(data.get("primary")))
                    .findFirst()
                    .map(data -> data.get("email").toString());
            var fallbackEmail = this.additionalData.stream()
                    .findFirst()
                    .map(data -> data.get("email").toString());
            email = optionalVerifiedPrimaryEmail.orElseGet(fallbackEmail::get);
        } else {
            email = optionalPublicEmail.get();
        }
        return email;
    }

    @Override
    public String getImageUrl() {
        return Optional.ofNullable(this.attributes.get("avatar_url")).map(Object::toString).orElse("");
    }
}
