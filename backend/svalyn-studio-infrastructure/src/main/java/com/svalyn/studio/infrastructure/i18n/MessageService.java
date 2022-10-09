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

package com.svalyn.studio.infrastructure.i18n;

import com.svalyn.studio.domain.message.api.IMessageService;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * Used to compute internationalized messages.
 *
 * @author sbegaudeau
 */
@Service
public class MessageService implements IMessageService {

    private final MessageSourceAccessor messageSourceAccessor;

    public MessageService(MessageSourceAccessor messageSourceAccessor) {
        this.messageSourceAccessor = Objects.requireNonNull(messageSourceAccessor);
    }

    @Override
    public String cannotBeBlank(String fieldName) {
        return this.messageSourceAccessor.getMessage("Error.cannotBeBlank", new Object[] { fieldName });
    }

    @Override
    public String alreadyExists(String type) {
        return this.messageSourceAccessor.getMessage("Error.alreadyExists", new Object[] { type });
    }

    @Override
    public String doesNotExist(String type) {
        return this.messageSourceAccessor.getMessage("Error.doesNotExist", new Object[] { type });
    }

    @Override
    public String unauthorized() {
        return this.messageSourceAccessor.getMessage("Error.unauthorized");
    }

    @Override
    public String tooLong(String fieldName) {
        return this.messageSourceAccessor.getMessage("Error.tooLong", new Object[] { fieldName });
    }
}
