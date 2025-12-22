import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';

interface TextareaRendererProps {
  component: ComponentNode;
}

export const TextareaRenderer: React.FC<TextareaRendererProps> = ({ component }) => {
  const { placeholder, rows, style } = component.props;
  const selectComponent = useEditorStore(state => state.selectComponent);

  return (
    <textarea
      placeholder={placeholder}
      rows={rows}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
    />
  );
};

