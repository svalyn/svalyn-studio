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

import { gql, useQuery } from '@apollo/client';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import { DiagramEditor } from '../../diagram/DiagramEditor';
import { Diagram } from '../../diagram/DiagramEditor.types';
import { Navbar } from '../../navbars/Navbar';
import { GetDomainData, GetDomainVariables } from './DomainView.types';
import { convertDomain } from './converters';

const getDomainQuery = gql`
  query getDomain($domainIdentifier: ID!) {
    viewer {
      domain(identifier: $domainIdentifier) {
        identifier
        label
        version
        entities {
          name
          attributes {
            name
            type
          }
          relations {
            name
            type
          }
        }
        dataTypes {
          name
        }
        enumerations {
          name
          literals {
            name
          }
        }
      }
    }
  }
`;

export const DomainView = () => {
  const { domainIdentifier } = useParams();

  const variables: GetDomainVariables = {
    domainIdentifier: domainIdentifier || '',
  };
  const { data } = useQuery<GetDomainData, GetDomainVariables>(getDomainQuery, { variables });
  const diagram: Diagram | null = data ? convertDomain(data.viewer.domain) : null;

  return (
    <div>
      <Navbar />
      <Container maxWidth="lg">
        {data && diagram ? (
          <>
            <Toolbar />
            <Typography variant="h4" gutterBottom>
              {data.viewer.domain.label}@{data.viewer.domain.version}
            </Typography>
            <DiagramEditor diagram={diagram} />
          </>
        ) : null}
      </Container>
    </div>
  );
};
