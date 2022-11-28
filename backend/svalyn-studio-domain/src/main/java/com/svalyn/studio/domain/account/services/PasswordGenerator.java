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

package com.svalyn.studio.domain.account.services;

import com.svalyn.studio.domain.account.services.api.IPasswordGenerator;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

/**
 * Used to generate passwords.
 *
 * @author sbegaudeau
 */
@Service
public class PasswordGenerator implements IPasswordGenerator {
    @Override
    public String generatePassword() {
        int numberCount = new SecureRandom().nextInt(8) + 4;
        int specialCharCount = new SecureRandom().nextInt(8) + 4;
        int upperCaseChar = new SecureRandom().nextInt(10) + 8;
        int lowerCaseChar = new SecureRandom().nextInt(10) + 8;

        Stream<Character> pwdStream = Stream.of(
                getRandomNumbers(numberCount),
                getRandomSpecialChars(specialCharCount),
                getRandomAlphabets(upperCaseChar, true),
                getRandomAlphabets(lowerCaseChar, false)
        ).flatMap(stream -> stream);
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
