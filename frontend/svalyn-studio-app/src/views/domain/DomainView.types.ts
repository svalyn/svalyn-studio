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

export interface GetDomainVariables {
  domainIdentifier: string;
}

export interface GetDomainData {
  viewer: Viewer;
}

export interface Viewer {
  domain: Domain;
}

export interface Domain {
  identifier: string;
  label: string;
  version: string;
  entities: Entity[];
  dataTypes: DataType[];
  enumerations: Enumeration[];
}

export interface Entity {
  name: string;
  attributes: Attribute[];
  relations: Relation[];
}

export interface Attribute {
  name: string;
  type: string;
}

export interface Relation {
  name: string;
  type: string;
}

export interface DataType {
  name: string;
}

export interface Enumeration {
  name: string;
  literals: EnumerationLiteral[];
}

export interface EnumerationLiteral {
  name: string;
}
