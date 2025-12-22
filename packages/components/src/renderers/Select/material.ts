import { ComponentMaterial } from '@lego/utils';
import { COMPONENT_TYPES } from '@lego/utils';

export const selectMaterial: ComponentMaterial = {
  type: COMPONENT_TYPES.SELECT,
  name: '下拉框',
  icon: '📊',
  defaultProps: {
    placeholder: '请选择',
    options: [
      { label: '选项1', value: '1' },
      { label: '选项2', value: '2' },
    ],
    style: { width: '20%', },
  },
};

