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

package com.svalyn.studio.domain.tag.repositories;

import com.svalyn.studio.domain.tag.OrganizationTag;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository used to persist and retrieve organization tags.
 *
 * @author sbegaudeau
 */
@Repository
public interface IOrganizationTagRepository extends PagingAndSortingRepository<OrganizationTag, UUID>, ListCrudRepository<OrganizationTag, UUID> {
    @Query(value = """
    SELECT
      CASE WHEN COUNT(organizationTag) > 0
      THEN TRUE
      ELSE FALSE
      END
    FROM organization_tag organizationTag
    JOIN tag tag ON tag.id = organizationTag.tag_id
    WHERE organizationTag.organization_id = :organizationId AND tag.key = :key AND tag.value = :value
    """)
    boolean existsByKeyAndValue(UUID organizationId, String key, String value);
}
