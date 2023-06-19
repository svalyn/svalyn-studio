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

package com.svalyn.studio.domain.activity.repositories;

import com.svalyn.studio.domain.activity.ActivityEntry;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository used to persist and retrieve organization activity entries.
 *
 * @author sbegaudeau
 */
@Repository
public interface IActivityEntryRepository extends PagingAndSortingRepository<ActivityEntry, UUID>, ListCrudRepository<ActivityEntry, UUID> {

    @Query(value = """
    SELECT activityEntry.*
    FROM activity activityEntry
    ORDER BY activityEntry.created_on DESC
    LIMIT :limit
    OFFSET :offset
    """)
    List<ActivityEntry> findAllVisibleByUserId(UUID userId, long offset, int limit);

    @Query(value = """
    SELECT activityEntry.*
    FROM activity activityEntry
    WHERE activityEntry.created_by = :userId
    ORDER BY activityEntry.created_on DESC
    LIMIT :limit
    OFFSET :offset
    """)
    List<ActivityEntry> findAllByUserId(UUID userId, long offset, int limit);

    @Query(value = """
    SELECT COUNT(activityEntry)
    FROM activity activityEntry
    WHERE activityEntry.created_by = :userId
    """)
    long countAllByUserId(UUID userId);

    @Query(value = """
    SELECT activityEntry.*
    FROM activity activityEntry
    JOIN organization_activity organizationActivityEntry ON organizationActivityEntry.activity_id = activityEntry.id
    WHERE organizationActivityEntry.organization_id = :organizationId
    ORDER BY activityEntry.created_on DESC
    LIMIT :limit
    OFFSET :offset
    """)
    List<ActivityEntry> findAllByOrganizationId(UUID organizationId, long offset, int limit);

    @Query(value = """
    SELECT COUNT(activityEntry)
    FROM activity activityEntry
    JOIN organization_activity organizationActivityEntry ON organizationActivityEntry.activity_id = activityEntry.id
    WHERE organizationActivityEntry.organization_id = :organizationId
    """)
    long countAllByOrganizationId(UUID organizationId);

    @Query(value = """
    SELECT activityEntry.*
    FROM activity activityEntry
    JOIN project_activity projectActivityEntry ON projectActivityEntry.activity_id = activityEntry.id
    WHERE projectActivityEntry.project_id = :projectId
    ORDER BY activityEntry.created_on DESC
    LIMIT :limit
    OFFSET :offset
    """)
    List<ActivityEntry> findAllByProjectId(UUID projectId, long offset, int limit);

    @Query(value = """
    SELECT COUNT(activityEntry)
    FROM activity activityEntry
    JOIN project_activity projectActivityEntry ON projectActivityEntry.activity_id = activityEntry.id
    WHERE projectActivityEntry.project_id = :projectId
    """)
    long countAllByProjectId(UUID projectId);
}
