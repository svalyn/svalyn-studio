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

package com.svalyn.studio.domain.project.repositories;

import com.svalyn.studio.domain.project.Project;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository used to persist and retrieve projects.
 *
 * @author sbegaudeau
 */
@Repository
public interface IProjectRepository extends PagingAndSortingRepository<Project, UUID>, ListCrudRepository<Project, UUID> {

    Optional<Project> findByIdentifier(String identifier);

    @Query("""
    SELECT * FROM project project
    WHERE project.organization_id = :organizationId
    ORDER BY project.created_on DESC
    LIMIT :limit
    OFFSET :offset
    """)
    List<Project> findAllByOrganizationId(UUID organizationId, long offset, int limit);

    @Query("""
    SELECT count(*) FROM project project
    WHERE project.organization_id = :organizationId
    """)
    long countAllByOrganizationId(UUID organizationId);

    @Query("""
    SELECT *, ts_rank_cd(textsearchable_generated, query) AS rank
    FROM project project, plainto_tsquery('english', :query) query
    WHERE textsearchable_generated @@ query
    ORDER BY rank
    LIMIT :limit
    OFFSET :offset
    """)
    List<Project> searchAllMatching(String query, long offset, int limit);

    @Query("""
    SELECT count(*)
    FROM project project, plainto_tsquery('english', :query) query
    WHERE textsearchable_generated @@ query
    """)
    long countAllMatching(String query);
}
