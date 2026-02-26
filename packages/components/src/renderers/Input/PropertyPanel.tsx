import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { Input, Switch } from '@arco-design/web-react';

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
        <label style={{ display: 'block', marginBottom: '4px' }}>字段名（name）</label>
        <Input
          value={props.name}
          onChange={(val) => onPropChange('name', val)}
          placeholder="例如：phone"
        />
      </div>
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ display: 'block', marginBottom: 0 }}>必填</label>
        <Switch
          checked={!!props.required}
          onChange={(checked) => onPropChange('required', checked)}
          size="small"
        />
      </div>
      {props.required ? (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>必填提示</label>
          <Input
            value={props.requiredMessage}
            onChange={(val) => onPropChange('requiredMessage', val)}
            placeholder="例如：手机号不能为空"
          />
        </div>
      ) : null}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>默认值</label>
        <Input
          value={props.defaultValue}
          onChange={(val) => onPropChange('defaultValue', val)}
          placeholder="（可选）"
        />
      </div>
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

