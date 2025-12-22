import { ComponentMaterial } from '@lego/utils';
import { COMPONENT_TYPES } from '@lego/utils';

export const textareaMaterial: ComponentMaterial = {
  type: COMPONENT_TYPES.TEXTAREA,
  name: '文本域',
  icon: '📄',
  defaultProps: {
    placeholder: '请输入多行文本',
    rows: 4,
    style: { width: '300px' },
  },
};

