import React from 'react';
import { ComponentPanel } from './components/ComponentPanel';
import { EditorCanvas } from './components/EditorCanvas';
import { PropertyPanel } from './components/PropertyPanel';

export const VisualEditor: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
      }}
    >
      <ComponentPanel />
      <EditorCanvas />
      <PropertyPanel />
    </div>
  );
};