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
package com.svalyn.studio.domain.account.repositories;

import com.svalyn.studio.domain.account.Account;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository used to persist and retrieve accounts.
 *
 * @author sbegaudeau
 */
@Repository
public interface IAccountRepository extends PagingAndSortingRepository<Account, UUID>, ListCrudRepository<Account, UUID> {
    Optional<Account> findByUsername(String username);

    Optional<Account> findByEmail(String email);

    @Query("""
    SELECT * FROM account account
    JOIN oauth2_metadata oauth2 ON account.id = oauth2.account_id
    WHERE oauth2.provider = :provider AND oauth2.provider_id = :providerId
    """)
    Optional<Account> findByOAuth2Metadata(String provider, String providerId);

    @Query("""
    SELECT * FROM account account
    JOIN authentication_token authenticationToken ON account.id = authenticationToken.account_id
    WHERE authenticationToken.access_key = :accessKey AND authenticationToken.status = 'ACTIVE'
    """)
    Optional<Account> findByAccessKey(String accessKey);
}
