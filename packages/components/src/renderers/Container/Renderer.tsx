import React from 'react';
import { ComponentRenderer } from '../../ComponentRenderer';
import type { BaseComponent, ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';

interface ContainerRendererProps {
  component: BaseComponent & { children?: ComponentNode[] };
}

export const ContainerRenderer: React.FC<ContainerRendererProps> = ({ component }) => {
  const { style, children } = component.props;
  const selectComponent = useEditorStore(state => state.selectComponent);

  return (
    <div
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
    >
      {children?.map((child: ComponentNode) => (
        <ComponentRenderer key={child.id} component={child} />
      ))}
    </div>
  );
};

