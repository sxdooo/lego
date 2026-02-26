import React, { useCallback, useState } from 'react';
import { ComponentRenderer } from '../../ComponentRenderer';
import type { BaseComponent, ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';

interface ContainerRendererProps {
  component: BaseComponent & { children?: ComponentNode[] };
}

export const ContainerRenderer: React.FC<ContainerRendererProps> = ({ component }) => {
  const { style } = component.props;
  const children = component.children;
  const selectComponent = useEditorStore(state => state.selectComponent);
  const addComponent = useEditorStore(state => state.addComponent);
  const moveComponent = useEditorStore(state => state.moveComponent);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    try {
      const componentData = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (componentData?.kind === 'existing' && componentData?.componentId) {
        if (componentData.componentId === component.id) return;
        moveComponent(String(componentData.componentId), component.id);
        return;
      }
      if (componentData && componentData.type) {
        addComponent(componentData, component.id);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse dropped component:', error);
    }
  }, [addComponent, component.id, moveComponent]);

  return (
    <div
      style={{
        ...style,
        outline: dragOver ? '2px solid #2b7dbc' : undefined,
        outlineOffset: dragOver ? 2 : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children?.map((child: ComponentNode) => (
        <ComponentRenderer key={child.id} component={child} />
      ))}
    </div>
  );
};

