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
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * Used to create the default accounts while the server is starting.
 *
 * @author sbegaudeau
 */
@Service
public class DefaultAccountsInitializer implements CommandLineRunner {
    private final IAccountRepository accountRepository;

    private final PasswordEncoder passwordEncoder;

    private final Logger logger = LoggerFactory.getLogger(DefaultAccountsInitializer.class);

    public DefaultAccountsInitializer(IAccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = Objects.requireNonNull(accountRepository);
        this.passwordEncoder = Objects.requireNonNull(passwordEncoder);
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!this.accountRepository.findByUsername("admin").isPresent()) {
            var password = this.generateSecureRandomPassword();
            this.logger.info("The \"admin\" account has been created with the password \"" + password + "\" (ignore the quotes)");

            var adminAccount = Account.newAccount()
                    .provider("svalyn")
                    .providerId("<none>")
                    .role("ADMIN")
                    .username("admin")
                    .password(this.passwordEncoder.encode(password))
                    .name("Admin")
                    .email("")
                    .imageUrl("")
                    .build();

            this.accountRepository.save(adminAccount);
        }
    }

    public String generateSecureRandomPassword() {
        Stream<Character> pwdStream = Stream.concat(getRandomNumbers(4), Stream.concat(getRandomSpecialChars(5), Stream.concat(getRandomAlphabets(7, true), getRandomAlphabets(9, false))));
        List<Character> charList = pwdStream.collect(Collectors.toList());
        Collections.shuffle(charList);
        String password = charList.stream()
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString();
        return password;
    }

    public Stream<Character> getRandomAlphabets(int count, boolean upperCase) {
        IntStream characters = null;
        if (upperCase) {
            characters = new SecureRandom().ints(count, 65, 90);
        } else {
            characters = new SecureRandom().ints(count, 97, 122);
        }
        return characters.mapToObj(data -> (char) data);
    }

    public Stream<Character> getRandomNumbers(int count) {
        return new SecureRandom().ints(count, 48, 57).mapToObj(data -> (char) data);
    }

    public Stream<Character> getRandomSpecialChars(int count) {
        return new SecureRandom().ints(count, 33, 45).mapToObj(data -> (char) data);
    }
}
