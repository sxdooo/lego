export interface BaseComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentNode[];
}

export interface ComponentNode extends BaseComponent {
  parentId?: string;
}

export interface EditorState {
  components: ComponentNode[];
  selectedId?: string;
  draggingComponent?: BaseComponent;
}

export interface ComponentMaterial {
  type: string;
  name: string;
  icon: string;
  defaultProps: Record<string, any>;
  isContainer?: boolean;
}