import React, { useCallback } from 'react';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { ComponentRenderer } from '@lego/components';
import { COMPONENT_TYPES } from '@lego/utils';
import type { ComponentNode } from '@lego/utils';
// import { ComponentNode } from '@lego/utils';

export const EditorCanvas: React.FC = () => {
  const { components, addComponent, selectComponent, selectedId } = useEditorStore();

  const findInTree = useCallback((nodes: ComponentNode[], id?: string): ComponentNode | undefined => {
    if (!id) return undefined;
    for (const n of nodes) {
      if (n.id === id) return n;
      if (Array.isArray(n.children) && n.children.length) {
        const found = findInTree(n.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const componentData = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (componentData && componentData.type) {
        const selected = findInTree(components as ComponentNode[], selectedId);
        const canBeParent =
          selected?.type === COMPONENT_TYPES.FORM ||
          selected?.type === COMPONENT_TYPES.CONTAINER;
        addComponent(componentData, canBeParent ? selected!.id : undefined);
      }
    } catch (error) {
      console.error('Failed to parse dropped component:', error);
    }
  }, [addComponent, components, findInTree, selectedId]);

  const handleCanvasClick = useCallback(() => {
    selectComponent('');
  }, [selectComponent]);

  return (
    <div
      style={{
        flex: 1,
        minWidth: '400px',
        position: 'relative',
        height: '100%',
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