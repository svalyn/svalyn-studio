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

import com.svalyn.studio.domain.account.Account;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * The user service which will retrieve and update the domain using the oauth2 user info.
 *
 * @author sbegaudeau
 */
@Service
@Transactional
public class SvalynOAuth2UserService extends DefaultOAuth2UserService {

    private final IAccountRepository accountRepository;

    private final WebClient webClient;

    private final Logger logger = LoggerFactory.getLogger(SvalynOAuth2UserService.class);

    public SvalynOAuth2UserService(IAccountRepository accountRepository, WebClient webClient) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.webClient = Objects.requireNonNull(webClient);
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        this.logger.debug("Data retrieved for user " + userRequest.getClientRegistration().getRegistrationId() + "#" + oAuth2User.getAttributes().get("id"));

        OAuth2AuthorizedClient client = new OAuth2AuthorizedClient(userRequest.getClientRegistration(), oAuth2User.getName(), userRequest.getAccessToken());
        List<Map<String, Object>> additionalData = new ArrayList<>();

        if (userRequest.getClientRegistration().getRegistrationId().equalsIgnoreCase("github")) {
            additionalData = webClient.get()
                    .uri("https://api.github.com/user/emails")
                    .attributes(ServletOAuth2AuthorizedClientExchangeFilterFunction.oauth2AuthorizedClient(client))
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();
        }

        var optionalOAuth2UserInfo = this.getUserInfo(userRequest.getClientRegistration().getRegistrationId(), oAuth2User, additionalData);

        if (optionalOAuth2UserInfo.isEmpty()) {
            throw new OAuth2AuthenticationException("The OAuth2 provider " + userRequest.getClientRegistration().getRegistrationId() + ", used for the authentication, is not supported");
        }

        var oAuth2UserInfo = optionalOAuth2UserInfo.get();
        Account account;

        var optionalExistingAccountEntity = this.accountRepository.findByEmail(oAuth2UserInfo.getEmail());
        if (optionalExistingAccountEntity.isPresent()) {
            var existingAccountEntity = optionalExistingAccountEntity.get();
            if (!existingAccountEntity.getProvider().equalsIgnoreCase(userRequest.getClientRegistration().getRegistrationId())) {
                throw new OAuth2AuthenticationException("You are trying to log in using " + userRequest.getClientRegistration().getRegistrationId() + " but your account has been created using " + existingAccountEntity.getProvider());
            }
            account = this.updateAccount(existingAccountEntity, userRequest, oAuth2UserInfo);
        } else {
            account = this.createAccount(userRequest, oAuth2UserInfo);
        }

        return new SvalynOAuth2User(account, oAuth2User);
    }

    private Optional<OAuth2UserInfo> getUserInfo(String registrationId, OAuth2User oAuth2User, List<Map<String, Object>> additionalData) {
        if (registrationId.equalsIgnoreCase("github")) {
            return Optional.of(new GithubOAuth2UserInfo(oAuth2User.getAttributes(), additionalData));
        }
        return Optional.empty();
    }

    private Account updateAccount(Account account, OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        this.logger.debug("Updating account " + oAuth2UserRequest.getClientRegistration().getRegistrationId() + "#" + oAuth2UserInfo.getId());

        account.updateDetails(oAuth2UserInfo.getName(), oAuth2UserInfo.getImageUrl());
        return this.accountRepository.save(account);
    }

    private Account createAccount(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        this.logger.debug("Creating account " + oAuth2UserRequest.getClientRegistration().getRegistrationId() + "#" + oAuth2UserInfo.getId());

        var account = Account.newAccount()
                .provider(oAuth2UserRequest.getClientRegistration().getRegistrationId())
                .providerId(oAuth2UserInfo.getId())
                .name(oAuth2UserInfo.getName())
                .email(oAuth2UserInfo.getEmail())
                .imageUrl(oAuth2UserInfo.getImageUrl())
                .build();

        return this.accountRepository.save(account);
    }
}
