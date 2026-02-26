import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { Input, Switch } from '@arco-design/web-react';
const LabelDiv: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ margin: '5px 0', ...(style || {}) }}>{children}</div>
);

interface SelectPropertyPanelProps {
  component: ComponentNode;
  onPropChange: (propName: string, value: any) => void;
}

const selfPropertiesMap = {
  placeholder: {
    label: '选择框占位符',
    type: 'string',
  },
  options: {
    label: '选项',
    type: 'options',
    itemType: 'object',
    itemProps: {
      label: '选项文字',
      type: 'string',
    },
  },
};

export const SelectPropertyPanel: React.FC<SelectPropertyPanelProps> = ({
  component,
  onPropChange,
}) => {
  const { props } = component;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <LabelDiv>字段名（name）</LabelDiv>
        <Input
          value={props.name}
          onChange={(val) => onPropChange('name', val)}
          placeholder="例如：gender"
          size="mini"
        />
      </div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LabelDiv style={{ margin: 0 }}>必填</LabelDiv>
        <Switch
          checked={!!props.required}
          onChange={(checked) => onPropChange('required', checked)}
          size="small"
        />
      </div>
      {props.required ? (
        <div style={{ marginBottom: 12 }}>
          <LabelDiv>必填提示</LabelDiv>
          <Input
            value={props.requiredMessage}
            onChange={(val) => onPropChange('requiredMessage', val)}
            placeholder="例如：请选择性别"
            size="mini"
          />
        </div>
      ) : null}
      <div style={{ marginBottom: 12 }}>
        <LabelDiv>默认值</LabelDiv>
        <Input
          value={props.defaultValue}
          onChange={(val) => onPropChange('defaultValue', val)}
          placeholder="（可选）"
          size="mini"
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        {
          Object.keys(selfPropertiesMap).map((key) => {
            switch (selfPropertiesMap?.[key as keyof typeof selfPropertiesMap]?.type) {
              case 'string':
                return (
                  <>
                    <LabelDiv>{selfPropertiesMap?.[key as keyof typeof selfPropertiesMap]?.label}</LabelDiv>
                    <Input
                      value={props?.[key]}
                      onChange={(val) => onPropChange(key, val)}
                      size='mini'
                    />
                  </>
                )
              case 'options':
                return (
                  <>
                    {/* <LabelDiv>{selfPropertiesMap?.[key as keyof typeof selfPropertiesMap]?.label}</LabelDiv> */}

                  </>
                )
            }
          })
        }

      </div>
    </div>
  );
};

