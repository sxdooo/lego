import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';

interface InputRendererProps {
  component: ComponentNode;
}

export const InputRenderer: React.FC<InputRendererProps> = ({ component }) => {
  const { placeholder, style } = component.props;
  const selectComponent = useEditorStore(state => state.selectComponent);

  return (
    <input
      placeholder={placeholder}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
    />
  );
};

