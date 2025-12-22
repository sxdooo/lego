import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { Select } from '@arco-design/web-react';

interface Option {
  label: string;
  value: string;
}

interface SelectRendererProps {
  component: ComponentNode;
}

export const SelectRenderer: React.FC<SelectRendererProps> = ({ component }) => {
  const { options, placeholder, style } = component.props;
  const selectComponent = useEditorStore(state => state.selectComponent);

  return (
    <Select
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
      placeholder={placeholder}
    >
      {options?.map((option: Option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

