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

package com.svalyn.studio.application.controllers.account;

import com.svalyn.studio.domain.account.repositories.IAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.IOException;
import java.util.Objects;

/**
 * Controller used to retrieve avatar image.
 *
 * @author sbegaudeau
 */
@Controller
public class AvatarController {

    private final IAccountRepository accountRepository;

    private final Logger logger = LoggerFactory.getLogger(AvatarController.class);

    public AvatarController(IAccountRepository accountRepository) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
    }

    @GetMapping(value = "/api/avatars/{username}")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String username) {
        return this.accountRepository.findByUsername(username)
                .filter(account -> account.getImage() != null && account.getImageContentType() != null)
                .map(account -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, account.getImageContentType())
                        .body(account.getImage()))
                .orElse(this.defaultAvatar());
    }

    public ResponseEntity<byte[]> defaultAvatar() {
        byte[] content = new byte[] {};
        var avatar = new ClassPathResource("images/avatar.png");
        try {
            content = avatar.getContentAsByteArray();
        } catch (IOException exception) {
            logger.warn(exception.getMessage(), exception);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/png")
                .body(content);
    }
}
