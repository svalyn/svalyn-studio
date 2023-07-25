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

package com.svalyn.studio.infrastructure.avatar;

import com.svalyn.studio.infrastructure.avatar.api.AvatarData;
import com.svalyn.studio.infrastructure.avatar.api.IAvatarRetrievalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyExtractors;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.Objects;
import java.util.Optional;

/**
 * Used to download avatars.
 *
 * @author sbegaudeau
 */
@Service
public class AvatarRetrievalService implements IAvatarRetrievalService {

    private final WebClient webClient;

    private final Logger logger = LoggerFactory.getLogger(AvatarRetrievalService.class);

    public AvatarRetrievalService(WebClient webClient) {
        this.webClient = Objects.requireNonNull(webClient);
    }

    @Override
    public Optional<AvatarData> getData(String imageUrl) {
        Optional<AvatarData> optionalImageData = Optional.empty();

        try (
            var outputStream = new PipedOutputStream();
            var inputStream = new PipedInputStream(outputStream);
        ) {
            var responseEntity = this.webClient.get()
                    .uri(imageUrl)
                    .retrieve()
                    .toEntityFlux(BodyExtractors.toDataBuffers())
                    .doOnError(error -> this.logger.warn(error.getMessage(), error))
                    .block();

            if (responseEntity != null && responseEntity.hasBody()) {
                DataBufferUtils.write(responseEntity.getBody(), outputStream)
                        .doFinally(signalType -> {
                            try {
                                outputStream.close();
                            } catch (IOException exception) {
                                this.logger.warn(exception.getMessage(), exception);
                            }
                        }).subscribe(DataBufferUtils.releaseConsumer());

                var contentType = Optional.of(responseEntity)
                        .map(ResponseEntity::getHeaders)
                        .map(HttpHeaders::getContentType)
                        .map(Object::toString)
                        .orElse(null);

                optionalImageData = Optional.of(new AvatarData(inputStream.readAllBytes(), contentType));
            }
        } catch (IOException exception) {
            this.logger.warn(exception.getMessage(), exception);
        }

        return optionalImageData;
    }
}
