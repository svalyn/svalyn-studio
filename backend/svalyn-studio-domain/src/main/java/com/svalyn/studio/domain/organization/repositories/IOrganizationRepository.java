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
package com.svalyn.studio.domain.organization.repositories;

import com.svalyn.studio.domain.organization.MembershipRole;
import com.svalyn.studio.domain.organization.Organization;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository used to persist and retrieve organizations.
 *
 * @author sbegaudeau
 */
@Repository
public interface IOrganizationRepository extends PagingAndSortingRepository<Organization, UUID>, ListCrudRepository<Organization, UUID> {
    boolean existsByIdentifier(String identifier);

    Optional<Organization> findByIdentifier(String identifier);

    @Query(value = """
    SELECT * FROM organization organization JOIN invitation invitation ON organization.id = invitation.organization_id
    WHERE invitation.member_id = :userId
    ORDER BY invitation.created_on DESC
    LIMIT :limit
    OFFSET :offset
    """)
    List<Organization> findAllWhereInvited(UUID userId, long offset, int limit);

    @Query(value = """
    SELECT count(*) FROM organization organization JOIN invitation invitation ON organization.id = invitation.organization_id
    WHERE invitation.member_id = :userId
    LIMIT :limit
    OFFSET :offset
    """)
    long countAllWhereInvited(UUID userId, long offset, int limit);

    @Query(value = """
    SELECT membership.role FROM organization organization JOIN membership membership ON organization.id = membership.organization_id
    WHERE organization.id = :organizationId AND membership.member_id = :userId
    """)
    Optional<MembershipRole> findMembershipRole(UUID userId, UUID organizationId);

    @Query("""
    SELECT *, ts_rank_cd(textsearchable_generated, query) AS rank
    FROM organization organization, plainto_tsquery(:query) query
    WHERE textsearchable_generated @@ query
    ORDER BY rank
    LIMIT :limit
    OFFSET :offset
    """)
    List<Organization> searchAllMatching(String query, long offset, int limit);

    @Query("""
    SELECT count(*)
    FROM organization organization, plainto_tsquery(:query) query
    WHERE textsearchable_generated @@ query
    """)
    long countAllMatching(String query);
}
