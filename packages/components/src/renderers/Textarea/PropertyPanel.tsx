import React from 'react';
import { ComponentNode } from '@lego/utils';
import { InputNumber, Input } from '@arco-design/web-react';

interface TextareaPropertyPanelProps {
  component: ComponentNode;
  onPropChange: (propName: string, value: any) => void;
}

export const TextareaPropertyPanel: React.FC<TextareaPropertyPanelProps> = ({
  component,
  onPropChange,
}) => {
  const { props } = component;

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>提示文字</label>
        <Input
          value={props.placeholder}
          onChange={(val) => onPropChange('placeholder', val)}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '4px' }}>行数</label>
        <InputNumber
          value={props.rows}
          min={1}
          max={10}
          onChange={(val) => onPropChange('rows', val)}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

