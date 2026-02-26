import type { ComponentNode } from '@lego/utils';
import type { ComponentType } from 'react';
import { COMPONENT_TYPES } from '@lego/utils';
import { TextPropertyPanel } from './renderers/Text/PropertyPanel';
import { InputPropertyPanel } from './renderers/Input/PropertyPanel';
import { SelectPropertyPanel } from './renderers/Select/PropertyPanel';
import { TextareaPropertyPanel } from './renderers/Textarea/PropertyPanel';
import { ContainerPropertyPanel } from './renderers/Container/PropertyPanel';
import { ButtonPropertyPanel } from './renderers/Button/PropertyPanel';

export interface ComponentPropertyPanelProps {
  component: ComponentNode;
  onPropChange: (propName: string, value: any) => void;
}

export const componentTypeToPropertyPanel: Record<
  string,
  ComponentType<ComponentPropertyPanelProps>
> = {
  [COMPONENT_TYPES.TEXT]: TextPropertyPanel,
  [COMPONENT_TYPES.INPUT]: InputPropertyPanel,
  [COMPONENT_TYPES.SELECT]: SelectPropertyPanel,
  [COMPONENT_TYPES.TEXTAREA]: TextareaPropertyPanel,
  [COMPONENT_TYPES.BUTTON]: ButtonPropertyPanel,
  [COMPONENT_TYPES.FORM]: ContainerPropertyPanel,
  [COMPONENT_TYPES.CONTAINER]: ContainerPropertyPanel,
};

