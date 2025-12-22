import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';

interface TextRendererProps {
  component: ComponentNode;
}

export const TextRenderer: React.FC<TextRendererProps> = ({ component }) => {
  const { content, style } = component.props;
  const selectComponent = useEditorStore(state => state.selectComponent);

  return (
    <div
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
    >
      {content}
    </div>
  );
};

