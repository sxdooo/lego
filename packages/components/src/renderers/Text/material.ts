import { ComponentMaterial } from '@lego/utils';
import { COMPONENT_TYPES } from '@lego/utils';

export const textMaterial: ComponentMaterial = {
  type: COMPONENT_TYPES.TEXT,
  name: '文本',
  icon: '📝',
  defaultProps: {
    content: '文本内容',
    style: { fontSize: '14px', color: '#333' },
  },
};

