import React from 'react';
import { componentMaterials } from '@lego/components/src/materials';
import { ComponentMaterial } from '@lego/components/src/ComponentMaterial';

export const ComponentPanel: React.FC = () => {
  return (
    <div
      style={{
        width: '250px',
        // background: '--color-bg-3',
        backgroundColor: '#fff',
        borderRight: '1px solid #ddd',
        padding: '12px',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ marginBottom: '20px' }}>组件库</h3>
      {componentMaterials.map((material) => (
        <ComponentMaterial key={material.type} material={material} />
      ))}
    </div>
  );
};