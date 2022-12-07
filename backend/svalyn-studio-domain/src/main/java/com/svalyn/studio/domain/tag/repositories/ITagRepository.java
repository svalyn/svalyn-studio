/*
 * Copyright (c) 2022, 2023 Stéphane Bégaudeau.
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

package com.svalyn.studio.domain.tag.repositories;

import com.svalyn.studio.domain.tag.Tag;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository used to persist and retrieve tags.
 *
 * @author sbegaudeau
 */
@Repository
public interface ITagRepository extends PagingAndSortingRepository<Tag, UUID>, ListCrudRepository<Tag, UUID> {

    @Query(value = """
    SELECT * FROM tag tag
    WHERE tag.key = :key AND tag.value = :value 
    """)
    Optional<Tag> findByKeyAndValue(String key, String value);

    @Query(value = """
    SELECT tag.*
    FROM tag tag
    JOIN organization_tag organizationTag ON tag.id = organizationTag.tag_id
    WHERE organizationTag.organization_id = :organizationId
    """)
    List<Tag> findAllByOrganizationId(UUID organizationId);

    @Query(value = """
    SELECT tag.*
    FROM tag tag
    JOIN organization_tag organizationTag ON tag.id = organizationTag.tag_id
    WHERE organizationTag.organization_id = :organizationId
    ORDER BY tag.key ASC, tag.value ASC
    LIMIT :limit
    OFFSET :offset
    """)
    List<Tag> findAllByOrganizationId(UUID organizationId, long offset, int limit);

    @Query(value = """
    SELECT COUNT(tag) FROM tag tag
    JOIN organization_tag organizationTag ON tag.id = organizationTag.tag_id
    WHERE organizationTag.organization_id = :organizationId
    """)
    long countAllByOrganizationId(UUID organizationId);

    @Query(value = """
    SELECT tag.*
    FROM tag tag
    JOIN project_tag projectTag ON tag.id = projectTag.tag_id
    WHERE projectTag.project_id = :projectId
    """)
    List<Tag> findAllByProjectId(UUID projectId);

    @Query(value = """
    SELECT tag.*
    FROM tag tag
    JOIN project_tag projectTag ON tag.id = projectTag.tag_id
    WHERE projectTag.project_id = :projectId
    ORDER BY tag.key ASC, tag.value ASC
    LIMIT :limit
    OFFSET :offset
    """)
    List<Tag> findAllByProjectId(UUID projectId, long offset, int limit);

    @Query(value = """
    SELECT COUNT(tag) FROM tag tag
    JOIN project_tag projectTag ON tag.id = projectTag.tag_id
    WHERE projectTag.project_id = :projectId
    """)
    long countAllByProjectId(UUID projectId);
}
