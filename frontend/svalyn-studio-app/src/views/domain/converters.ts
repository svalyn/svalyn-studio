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

import { Edge, Node } from 'reactflow';
import { Diagram } from '../../diagram/DiagramEditor.types';
import { ListItemData, ListNodeData } from '../../diagram/nodes/ListNode.types';
import { DataType, Domain, Entity, Enumeration } from './DomainView.types';

export const convertDomain = (domain: Domain): Diagram => {
  const nodes: Node[] = [];

  domain.entities.map((entity) => convertEntity(domain, entity)).forEach((node) => nodes.push(node));
  domain.dataTypes.map((dataType) => convertDataType(domain, dataType)).forEach((node) => nodes.push(node));
  domain.enumerations.map((enumeration) => convertEnumeration(domain, enumeration)).forEach((node) => nodes.push(node));

  const edges: Edge[] = [];
  domain.entities.forEach((entity) => {
    entity.relations.forEach((relation) => {
      const edge: Edge = {
        id: `${domain.identifier}::${entity.name} -> ${relation.type}`,
        source: `${domain.identifier}::${entity.name}`,
        target: relation.type,
        type: 'smoothstep',
      };

      edges.push(edge);
    });
  });

  const diagram: Diagram = {
    nodes,
    edges,
  };
  return diagram;
};

const convertEntity = (domain: Domain, entity: Entity): Node<ListNodeData> => {
  const listItems: ListItemData[] = entity.attributes.map((attribute) => {
    const listItem: ListItemData = {
      id: attribute.name,
      label: {
        content: `${attribute.name}: ${attribute.type}`,
        style: {
          color: '#212121',
        },
      },
      style: {
        padding: '4px 16px',
      },
    };
    return listItem;
  });

  const data: ListNodeData = {
    label: {
      content: entity.name,
      style: {
        color: '#212121',
        borderBottom: '1px solid #212121',
      },
    },
    listItems,
    style: {
      backgroundColor: '#FFF9C4',
      border: '1px solid #212121',
    },
  };

  return {
    id: `${domain.identifier}::${entity.name}`,
    type: 'listNode',
    data,
    position: {
      x: 0,
      y: 0,
    },
  };
};

const convertDataType = (domain: Domain, dataType: DataType) => {
  return {
    id: `${domain.identifier}::${dataType.name}`,
    data: {
      label: dataType.name,
    },
    position: {
      x: 0,
      y: 0,
    },
  };
};

const convertEnumeration = (domain: Domain, enumeration: Enumeration) => {
  return {
    id: `${domain.identifier}::${enumeration.name}`,
    data: {
      label: enumeration.name,
    },
    position: {
      x: 0,
      y: 0,
    },
  };
};
