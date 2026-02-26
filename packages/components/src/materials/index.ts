import type { ComponentMaterial } from '@lego/utils';
import { textMaterial } from '../renderers/Text/material';
import { inputMaterial } from '../renderers/Input/material';
import { selectMaterial } from '../renderers/Select/material';
import { textareaMaterial } from '../renderers/Textarea/material';
import { buttonMaterial } from '../renderers/Button/material';
import { formMaterial, containerMaterial } from '../renderers/Container/material';

export const componentMaterials: ComponentMaterial[] = [
  textMaterial,
  inputMaterial,
  selectMaterial,
  textareaMaterial,
  buttonMaterial,
  formMaterial,
  containerMaterial,
];