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

import { Handle, NodeProps, Position } from 'reactflow';
import { ListNodeData, RawListNodeProps } from './ListNode.types';

const listNodeStyle = (style: Partial<React.CSSProperties>): React.CSSProperties => {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    ...style,
  };
};

const listNodeHeaderStyle = (style: Partial<React.CSSProperties>): React.CSSProperties => {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 16px',
    ...style,
  };
};

const listItemStyle = (style: Partial<React.CSSProperties>): React.CSSProperties => {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    padding: '4px 8px',
    ...style,
  };
};

export const ListNode = ({ data }: NodeProps<ListNodeData>) => {
  return (
    <div>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <RawListNode data={data} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
};

export const RawListNode = ({ data }: RawListNodeProps) => {
  return (
    <div style={listNodeStyle(data.style)}>
      <div style={listNodeHeaderStyle(data.label.style)}>{data.label.content}</div>
      <div>
        {data.listItems.map((listItem) => {
          return (
            <div key={listItem.id} style={listItemStyle(listItem.style)}>
              {listItem.label.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
