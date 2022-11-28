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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.SerializationUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Base64;

/**
 * Used to persist the oauth2 authorization request in a cookie between the various requests.
 *
 * @author sbegaudeau
 */
@Service
public class HttpCookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE = "x-oauth2_auth_request";
    public static final String REDIRECT_URI_COOKIE = "x-redirect_uri";
    private static final String REDIRECT_URI_PARAMETER = "redirect_uri";

    private final Logger logger = LoggerFactory.getLogger(HttpCookieOAuth2AuthorizationRequestRepository.class);

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        this.logger.debug("HttpCookieOAuth2AuthorizationRequestRepository#loadAuthorizationRequest - " + request.getRequestURI());
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookie.getName().equalsIgnoreCase(OAUTH2_AUTHORIZATION_REQUEST_COOKIE))
                .findFirst()
                .map(Cookie::getValue)
                .map(Base64.getUrlDecoder()::decode)
                .map(SerializationUtils::deserialize)
                .filter(OAuth2AuthorizationRequest.class::isInstance)
                .map(OAuth2AuthorizationRequest.class::cast)
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        this.logger.debug("HttpCookieOAuth2AuthorizationRequestRepository#saveAuthorizationRequest - " + request.getRequestURI());
        String value = Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(authorizationRequest));
        Cookie oAuth2AuthorizationRequestCookie = new Cookie(OAUTH2_AUTHORIZATION_REQUEST_COOKIE, value);
        oAuth2AuthorizationRequestCookie.setPath("/");
        oAuth2AuthorizationRequestCookie.setHttpOnly(true);
        oAuth2AuthorizationRequestCookie.setMaxAge(360);
        response.addCookie(oAuth2AuthorizationRequestCookie);

        var redirectUri = request.getParameter(REDIRECT_URI_PARAMETER);
        if (redirectUri != null && !redirectUri.isBlank()) {
            Cookie redirectUriCookie = new Cookie(REDIRECT_URI_COOKIE, redirectUri);
            redirectUriCookie.setPath("/");
            redirectUriCookie.setHttpOnly(true);
            redirectUriCookie.setMaxAge(360);
            response.addCookie(redirectUriCookie);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        this.logger.debug("HttpCookieOAuth2AuthorizationRequestRepository#removeAuthorizationRequest - " + request.getRequestURI());

        var oAuth2AuthorizationRequest = this.loadAuthorizationRequest(request);

        for (var cookie: request.getCookies()) {
            if (cookie.getName().equalsIgnoreCase(OAUTH2_AUTHORIZATION_REQUEST_COOKIE)) {
                Cookie oAuth2AuthorizationRequestCookie = new Cookie(OAUTH2_AUTHORIZATION_REQUEST_COOKIE, "");
                oAuth2AuthorizationRequestCookie.setPath("/");
                oAuth2AuthorizationRequestCookie.setMaxAge(0);
                response.addCookie(oAuth2AuthorizationRequestCookie);
            } else if (cookie.getName().equalsIgnoreCase(REDIRECT_URI_COOKIE)) {
                Cookie redirectUriCookie = new Cookie(REDIRECT_URI_COOKIE, "");
                redirectUriCookie.setPath("/");
                redirectUriCookie.setMaxAge(0);
                response.addCookie(redirectUriCookie);
            }
        }
        return oAuth2AuthorizationRequest;
    }

}
