import React from 'react';
import { ResizeBox } from '@arco-design/web-react';
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
      {/* <ResizeBox
        directions={['right']}
        style={{
          maxWidth: '80%',
          textAlign: 'center',
        }}
      > */}
        <EditorCanvas />
      {/* </ResizeBox> */}
      <PropertyPanel />
    </div>
  );
};