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

package com.svalyn.studio.domain.changeproposal.repositories;

import com.svalyn.studio.domain.changeproposal.ChangeProposal;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Used to persist and retrieve change proposals.
 *
 * @author sbegaudeau
 */
@Repository
public interface IChangeProposalRepository extends PagingAndSortingRepository<ChangeProposal, UUID> {
    @Query("""
    SELECT * FROM change_proposal changeProposal
    WHERE changeProposal.project_id = :projectId
    ORDER BY changeProposal.created_on DESC
    LIMIT :limit
    OFFSET :offset
    """)
    List<ChangeProposal> findAllByProjectId(UUID projectId, long offset, int limit);

    @Query("""
    SELECT count(*) FROM change_proposal changeProposal
    WHERE changeProposal.project_id = :projectId
    """)
    long countAllByProjectId(UUID projectId);
}
