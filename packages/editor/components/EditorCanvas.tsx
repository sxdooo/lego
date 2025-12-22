import React, { useCallback } from 'react';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { ComponentRenderer } from '@lego/components';
// import { ComponentNode } from '@lego/utils';

export const EditorCanvas: React.FC = () => {
  const { components, addComponent, selectComponent, draggingComponent } = useEditorStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const componentData = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (componentData && componentData.type) {
        addComponent(componentData);
      }
    } catch (error) {
      console.error('Failed to parse dropped component:', error);
    }
  }, [addComponent]);

  const handleCanvasClick = useCallback(() => {
    selectComponent('');
  }, [selectComponent]);

  return (
    <div
      style={{
        flex: 1,
        minWidth: '400px',
        position: 'relative',
        height: 'calc(100vh - 92px)',
        overflowY: 'auto',
        background: '#fff',
        border: '0.5px solid #ddd',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
        {components.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#999',
              padding: '100px 0',
            }}
          >
            拖拽组件到这里开始设计
          </div>
        ) : (
          components.map((component: any) => (
            <ComponentRenderer key={component.id} component={component} />
          ))
        )}
    </div>
  );
};