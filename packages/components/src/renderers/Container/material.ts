import type { ComponentMaterial } from '@lego/utils';
import { COMPONENT_TYPES } from '@lego/utils';

export const formMaterial: ComponentMaterial = {
  type: COMPONENT_TYPES.FORM,
  name: '表单容器',
  icon: '📋',
  defaultProps: {
    layout: 'vertical',
    style: { padding: '20px', border: '1px solid #ddd' },
  },
  isContainer: true,
};

export const containerMaterial: ComponentMaterial = {
  type: COMPONENT_TYPES.CONTAINER,
  name: '容器',
  icon: '📦',
  defaultProps: {
    style: { padding: '10px', border: '1px dashed #ccc' },
  },
  isContainer: true,
};

