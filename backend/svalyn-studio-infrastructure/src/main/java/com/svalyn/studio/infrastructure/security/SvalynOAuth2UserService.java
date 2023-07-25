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
import com.svalyn.studio.domain.account.AccountRole;
import com.svalyn.studio.domain.account.OAuth2Metadata;
import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import com.svalyn.studio.infrastructure.avatar.api.AvatarData;
import com.svalyn.studio.infrastructure.avatar.api.IAvatarRetrievalService;
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
import java.util.Set;

/**
 * The user service which will retrieve and update the domain using the oauth2 user info.
 *
 * @author sbegaudeau
 */
@Service
@Transactional
public class SvalynOAuth2UserService extends DefaultOAuth2UserService {

    private final IAccountRepository accountRepository;

    private final IAvatarRetrievalService avatarRetrievalService;

    private final WebClient webClient;

    private final Logger logger = LoggerFactory.getLogger(SvalynOAuth2UserService.class);

    public SvalynOAuth2UserService(IAccountRepository accountRepository, IAvatarRetrievalService avatarRetrievalService, WebClient webClient) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.avatarRetrievalService = Objects.requireNonNull(avatarRetrievalService);
        this.webClient = Objects.requireNonNull(webClient);
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        var provider = userRequest.getClientRegistration().getRegistrationId();
        var providerId = Optional.ofNullable(oAuth2User.getAttributes().get("id")).map(Object::toString).orElse("");

        this.logger.debug("Data retrieved for user {}#{}", provider, providerId);

        Account account;

        var optionalExistingAccountEntity = this.accountRepository.findByOAuth2Metadata(provider, providerId);
        if (optionalExistingAccountEntity.isPresent()) {
            var existingAccountEntity = optionalExistingAccountEntity.get();

            var oAuth2UserInfo = this.getUserInfo(userRequest.getClientRegistration().getRegistrationId(), oAuth2User, List.of());
            account = this.updateAccount(existingAccountEntity, userRequest, oAuth2UserInfo);
        } else {
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

            var oAuth2UserInfo = this.getUserInfo(userRequest.getClientRegistration().getRegistrationId(), oAuth2User, additionalData);
            account = this.createAccount(userRequest, oAuth2UserInfo);
        }

        return new SvalynOAuth2User(account, oAuth2User, userRequest.getAccessToken());
    }

    private OAuth2UserInfo getUserInfo(String registrationId, OAuth2User oAuth2User, List<Map<String, Object>> additionalData) {
        if (registrationId.equalsIgnoreCase("github")) {
            return new GithubOAuth2UserInfo(oAuth2User.getAttributes(), additionalData);
        }

        this.logger.debug("OAuth2UserInfo empty");
        throw new OAuth2AuthenticationException("The OAuth2 provider " + registrationId + ", used for the authentication, is not supported");
    }

    private Account updateAccount(Account account, OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        this.logger.debug("Updating account {}#{}", oAuth2UserRequest.getClientRegistration().getRegistrationId(), oAuth2UserInfo.getId());

        var hasLoggedWithProvider = account.getOAuth2Metadata().stream()
                .anyMatch(oAuth2Metadata -> oAuth2Metadata.getProvider().equalsIgnoreCase(oAuth2UserRequest.getClientRegistration().getRegistrationId()));
        if (!hasLoggedWithProvider) {
            var oAuth2Metadata = OAuth2Metadata.newOAuth2Metadata()
                    .provider(oAuth2UserRequest.getClientRegistration().getRegistrationId())
                    .providerId(oAuth2UserInfo.getId())
                    .build();

            account.addOAuth2Metadata(oAuth2Metadata);
        } else if (!account.getName().equals(oAuth2UserInfo.getName())) {
            account.updateName(oAuth2UserInfo.getName());
        }

        return this.accountRepository.save(account);
    }

    private Account createAccount(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        this.logger.debug("Creating account {}#{}", oAuth2UserRequest.getClientRegistration().getRegistrationId(), oAuth2UserInfo.getId());

        var oAuth2Metadata = OAuth2Metadata.newOAuth2Metadata()
                .provider(oAuth2UserRequest.getClientRegistration().getRegistrationId())
                .providerId(oAuth2UserInfo.getId())
                .build();

        var optionalImageData = this.avatarRetrievalService.getData(oAuth2UserInfo.getImageUrl());

        var account = Account.newAccount()
                .role(AccountRole.USER)
                .username(oAuth2UserInfo.getUsername())
                .name(oAuth2UserInfo.getName())
                .email(oAuth2UserInfo.getEmail())
                .image(optionalImageData.map(AvatarData::content).orElse(null))
                .imageContentType(optionalImageData.map(AvatarData::contentType).orElse(null))
                .oAuth2Metadata(Set.of(oAuth2Metadata))
                .build();

        return this.accountRepository.save(account);
    }
}
