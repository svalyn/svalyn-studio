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

package com.svalyn.studio.message.history;

import com.svalyn.studio.message.account.AccountSummaryMessage;
import com.svalyn.studio.message.project.ProjectSummaryMessage;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * The public version of a change proposal.
 *
 * @author sbegaudeau
 */
public record ChangeProposalMessage(
        @NotNull UUID id,
        @NotNull String name,
        @NotNull String readMe,
        @NotNull ProjectSummaryMessage project,
        @NotNull ChangeMessage change,
        @NotNull List<ReviewMessage> reviews,
        @NotNull ChangeProposalStatus status,
        @NotNull AccountSummaryMessage createdBy,
        @NotNull Instant createdOn,
        @NotNull AccountSummaryMessage lastModifiedBy,
        @NotNull Instant lastModifiedOn) {
}
