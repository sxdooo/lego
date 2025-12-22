import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { Input } from '@arco-design/web-react';

interface InputPropertyPanelProps {
  component: ComponentNode;
  onPropChange: (propName: string, value: any) => void;
}

export const InputPropertyPanel: React.FC<InputPropertyPanelProps> = ({
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
    </div>
  );
};

