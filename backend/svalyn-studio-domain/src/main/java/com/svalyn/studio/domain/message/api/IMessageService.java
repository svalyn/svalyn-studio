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

package com.svalyn.studio.domain.message.api;

/**
 * Used to compute internationalized messages.
 *
 * @author sbegaudeau
 */
public interface IMessageService {
    String cannotBeBlank(String fieldName);
    String alreadyExists(String type);
    String doesNotExist(String type);
    String cannotBeEmpty(String type);
    String unauthorized();
    String invalid();
    String tooLong(String fieldName);

    /**
     * Implementation which does nothing, used to unit tests.
     *
     * @author sbegaudeau
     */
    class NoOp implements IMessageService {

        @Override
        public String cannotBeBlank(String fieldName) {
            return "";
        }

        @Override
        public String alreadyExists(String type) {
            return "";
        }

        @Override
        public String doesNotExist(String type) {
            return "";
        }

        @Override
        public String cannotBeEmpty(String type) {
            return "";
        }

        @Override
        public String unauthorized() {
            return "";
        }

        @Override
        public String invalid() {
            return "";
        }

        @Override
        public String tooLong(String fieldName) {
            return "";
        }
    }
}
