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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import java.util.Objects;

/**
 * Spring Security configuration.
 *
 * @author sbegaudeau
 */
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    private final SvalynOAuth2UserService oAuth2UserService;

    private final Logger logger = LoggerFactory.getLogger(SecurityConfiguration.class);

    public SecurityConfiguration(HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository, OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler, OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler, SvalynOAuth2UserService oAuth2UserService) {
        this.httpCookieOAuth2AuthorizationRequestRepository = Objects.requireNonNull(httpCookieOAuth2AuthorizationRequestRepository);
        this.oAuth2AuthenticationSuccessHandler = Objects.requireNonNull(oAuth2AuthenticationSuccessHandler);
        this.oAuth2AuthenticationFailureHandler = Objects.requireNonNull(oAuth2AuthenticationFailureHandler);
        this.oAuth2UserService = Objects.requireNonNull(oAuth2UserService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authz) -> {
            authz.requestMatchers("/api/graphql").authenticated();
            authz.requestMatchers("/api/avatars").authenticated();
            authz.requestMatchers("/**").permitAll();
        });

        http.cors();
        http.csrf().disable();
        // http.csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());

        http.oauth2Login()
                .authorizationEndpoint()
                    .authorizationRequestRepository(httpCookieOAuth2AuthorizationRequestRepository)
                    .and()
                .userInfoEndpoint()
                    .userService(this.oAuth2UserService)
                    .and()
                .loginPage("/login")
                .failureHandler(this.oAuth2AuthenticationFailureHandler)
                .successHandler(this.oAuth2AuthenticationSuccessHandler);

        AuthenticationSuccessHandler authenticationSuccessHandler = (HttpServletRequest request, HttpServletResponse response, Authentication authentication) -> {
            this.logger.debug("AuthenticationSuccessHandler: Status 200 OK");
            this.logger.debug("Request has session : " + request.getSession(false));
            response.setStatus(HttpStatus.OK.value());
        };
        AuthenticationFailureHandler authenticationFailureHandler = (HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) -> {
            this.logger.debug("AuthenticationFailureHandler: Status 401 UNAUTHORIZED");
            response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.getReasonPhrase());
        };
        http.formLogin()
                .loginPage("/login")
                .loginProcessingUrl("/api/login")
                .successHandler(authenticationSuccessHandler)
                .failureHandler(authenticationFailureHandler);
        http.rememberMe();

        LogoutSuccessHandler logoutSuccessHandler = (request, response, authentication) -> {
            this.logger.debug("LogoutSuccessHandler: Status 200 OK");
            response.setStatus(HttpStatus.OK.value());
        };
        http.logout()
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(logoutSuccessHandler)
                .permitAll();

        AuthenticationEntryPoint authenticationEntryPoint = (request, response, authException) -> {
            this.logger.debug("AuthenticationEntryPoint: Status 401 UNAUTHORIZED");
            response.sendError(HttpStatus.UNAUTHORIZED.value());
        };
        AccessDeniedHandler accessDeniedHandler = (request, response, accessDeniedException) -> {
            this.logger.debug("AccessDeniedHandler: Status 401 UNAUTHORIZED");
            response.sendError(HttpStatus.UNAUTHORIZED.value());
        };
        http.exceptionHandling()
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
