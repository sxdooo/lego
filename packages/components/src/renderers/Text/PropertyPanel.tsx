import React from 'react';
import { ComponentNode } from '@lego/utils';
import { Input } from '@arco-design/web-react';

interface TextPropertyPanelProps {
  component: ComponentNode;
  onPropChange: (propName: string, value: any) => void;
}

export const TextPropertyPanel: React.FC<TextPropertyPanelProps> = ({
  component,
  onPropChange,
}) => {
  const { props } = component;

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>内容</label>
        <Input
          value={props.content}
          onChange={(val) => onPropChange('content', val)}
        />
      </div>
    </div>
  );
};

