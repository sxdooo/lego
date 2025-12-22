import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { Input } from '@arco-design/web-react';
import styled from 'styled-components';

const LabelDiv = styled.div`
  margin: 5px 0;
`;

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

  const { style, ...selfProperties } = props;

  console.log('selfProperties', selfProperties);

  return (
    <div>
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

