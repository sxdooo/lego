import React, { useState } from 'react';
import { IconDelete } from '@arco-design/web-react/icon';
import type { ComponentNode } from '@lego/utils';
import { TextRenderer } from './renderers/Text/Renderer';
import { InputRenderer } from './renderers/Input/Renderer';
import { SelectRenderer } from './renderers/Select/Renderer';
import { ContainerRenderer } from './renderers/Container/Renderer';
import { TextareaRenderer } from './renderers/Textarea/Renderer';
import { ButtonRenderer } from './renderers/Button/Renderer';
import { COMPONENT_TYPES } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';

interface ComponentRendererProps {
  component: ComponentNode;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component }) => {
  const { type } = component;
  const selectedId = useEditorStore(state => state.selectedId);
  const removeComponent = useEditorStore(state => state.removeComponent);
  const selectComponent = useEditorStore(state => state.selectComponent);
  const isSelected = selectedId === component.id;
  const [isHovered, setIsHovered] = useState(false);
  const showOutline = isSelected || isHovered;
  const showDeleteButton = showOutline;

  const renderComponent = () => {
    switch (type) {
      case COMPONENT_TYPES.TEXT:
        return <TextRenderer component={component} />;
      case COMPONENT_TYPES.INPUT:
        return <InputRenderer component={component} />;
      case COMPONENT_TYPES.SELECT:
        return <SelectRenderer component={component} />;
      case COMPONENT_TYPES.TEXTAREA:
        return <TextareaRenderer component={component} />;
      case COMPONENT_TYPES.BUTTON:
        return <ButtonRenderer component={component} />;
      case COMPONENT_TYPES.FORM:
      case COMPONENT_TYPES.CONTAINER:
        return <ContainerRenderer component={component} />;
      default:
        return <div>Unknown component type: {type}</div>;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        outline: showOutline
          ? isSelected
            ? '1px dashed #2b7dbc'
            : '1px dashed #2b7dbc'
          : undefined,
        outlineOffset: showOutline ? '2px' : undefined,
        cursor: 'move',
      }}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(
          'text/plain',
          JSON.stringify({ kind: 'existing', componentId: component.id })
        );
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderComponent()}
      {showDeleteButton && (
        <button
          type="button"
          style={{
            position: 'absolute',
            top: '0px',
            right: '0px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            border: 'none',
            background: '#fff',
          }}
          onClick={(e) => {
            e.stopPropagation();
            removeComponent(component.id);
            selectComponent('');
          }}
        >
          <IconDelete/>
        </button>
      )}
    </div>
  );
};