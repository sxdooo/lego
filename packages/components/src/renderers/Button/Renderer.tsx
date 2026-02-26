import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { Button } from '@arco-design/web-react';

export const ButtonRenderer: React.FC<{ component: ComponentNode }> = ({ component }) => {
  const props = component.props ?? {};
  const text = props.text ?? '按钮';
  const style = props.style ?? {};

  return (
    <Button style={style} type="primary">
      {text}
    </Button>
  );
};

