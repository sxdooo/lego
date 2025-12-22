import { ComponentMaterial } from '@lego/utils';
import { COMPONENT_TYPES } from '@lego/utils';

export const inputMaterial: ComponentMaterial = {
  type: COMPONENT_TYPES.INPUT,
  name: '输入框',
  icon: '📋',
  defaultProps: {
    placeholder: '请输入内容',
    style: { width: '200px' },
  },
};

