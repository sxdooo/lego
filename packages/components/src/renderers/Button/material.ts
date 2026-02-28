import type { ComponentMaterial } from '@lego/utils';
import { COMPONENT_TYPES } from '@lego/utils';

export const buttonMaterial: ComponentMaterial = {
  type: COMPONENT_TYPES.BUTTON,
  name: '按钮',
  icon: '🔘',
  defaultProps: {
    text: '提交',
    style: {},
    events: {
      onClick: [
        {
          type: 'submitForm',
          formScope: 'closest',
          request: {
            method: 'POST',
            url: '/api/submit',
            headers: {
              'Content-Type': 'application/json',
            },
            bodySource: 'formValues',
          },
          successMessage: '提交成功',
          errorMessage: '提交失败',
        },
      ],
    },
    action: {
      type: 'submitForm',
      formScope: 'closest',
      request: {
        method: 'POST',
        url: '/api/submit',
        headers: {
          'Content-Type': 'application/json',
        },
        bodySource: 'formValues',
      },
      successMessage: '提交成功',
      errorMessage: '提交失败',
    },
  },
};

