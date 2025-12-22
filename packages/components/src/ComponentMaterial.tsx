import React from 'react';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { generateId } from '@lego/utils';
import type { BaseComponent } from '@lego/utils';

interface ComponentMaterialProps {
  material: any;
}

export const ComponentMaterial: React.FC<ComponentMaterialProps> = ({ material }) => {
  const { setDraggingComponent } = useEditorStore();

  const handleDragStart = (e: React.DragEvent) => {
    const component: BaseComponent = {
      id: generateId(),
      type: material.type,
      props: { ...material.defaultProps },
    };
    setDraggingComponent(component);
    e.dataTransfer.setData('text/plain', JSON.stringify(component));
  };

  const handleDragEnd = () => {
    setDraggingComponent(undefined);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        padding: '10px',
        margin: '5px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'move',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>{material.icon}</span>
      <span>{material.name}</span>
    </div>
  );
};