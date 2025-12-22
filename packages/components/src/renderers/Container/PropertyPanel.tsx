import React from 'react';
import type { BaseComponent } from '@lego/utils';
import { Input } from '@arco-design/web-react';

interface ContainerPropertyPanelProps {
  component: BaseComponent;
  onPropChange: (propName: string, value: any) => void;
}

export const ContainerPropertyPanel: React.FC<ContainerPropertyPanelProps> = ({
  component,
  onPropChange,
}) => {
  const { style } = component.props;

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>容器边距</label>
        <Input
          value={style?.padding}
          onChange={(val) => onPropChange('style', { ...style, padding: val })}
        />
      </div>
    </div>
  );
};

