import { create } from 'zustand';
import { generateId } from '@lego/utils';
import type { ComponentNode, BaseComponent } from '@lego/utils';

interface EditorState {
  components: ComponentNode[];
  selectedId?: string;
  draggingComponent?: BaseComponent;
}

interface EditorActions {
  addComponent: (component: BaseComponent, parentId?: string) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, props: Record<string, any>) => void;
  selectComponent: (id: string) => void;
  setDraggingComponent: (component?: BaseComponent) => void;
  moveComponent: (componentId: string, targetParentId: string) => void;
  setComponents: (components: ComponentNode[]) => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  components: [],
  selectedId: undefined,
  draggingComponent: undefined,

  addComponent: (component, parentId) => {
    const newComponent: ComponentNode = {
      ...component,
      id: `${component.type}_${generateId()}`,
      parentId,
      children: [],
    };

    set(state => {
      if (parentId) {
        // 添加到指定父组件
        const updateComponents = (components: ComponentNode[]): ComponentNode[] => {
          return components.map(comp => {
            if (comp.id === parentId) {
              return {
                ...comp,
                children: [...(comp.children || []), newComponent],
              };
            }
            if (comp.children) {
              return {
                ...comp,
                children: updateComponents(comp.children),
              };
            }
            return comp;
          });
        };
        return { components: updateComponents(state.components) };
      } else {
        // 添加到根级别
        return { components: [...state.components, newComponent] };
      }
    });
  },

  removeComponent: (id) => {
    set(state => {
      const removeFromTree = (components: ComponentNode[]): ComponentNode[] => {
        return components.filter(comp => {
          if (comp.id === id) return false;
          if (comp.children) {
            comp.children = removeFromTree(comp.children);
          }
          return true;
        });
      };
      return { components: removeFromTree(state.components) };
    });
  },

  updateComponent: (id, props) => {
    set(state => {
      const updateInTree = (components: ComponentNode[]): ComponentNode[] => {
        return components.map(comp => {
          if (comp.id === id) {
            return { ...comp, props: { ...comp.props, ...props } };
          }
          if (comp.children) {
            return {
              ...comp,
              children: updateInTree(comp.children),
            };
          }
          return comp;
        });
      };
      return { components: updateInTree(state.components) };
    });
  },

  selectComponent: (id) => {
    set({ selectedId: id });
  },

  setDraggingComponent: (component) => {
    set({ draggingComponent: component });
  },

  moveComponent: (componentId, targetParentId) => {
    // 实现组件移动逻辑
    const state = get();
    const component = findComponentInTree(state.components, componentId);
    if (!component) return;

    set(state => {
      // 从原位置移除
      let newComponents = removeComponentFromTree(state.components, componentId);
      // 添加到新位置
      newComponents = addComponentToTree(newComponents, component, targetParentId);
      return { components: newComponents };
    });
  },

  setComponents: (components) => {
    set({
      components: Array.isArray(components) ? components : [],
      selectedId: undefined,
      draggingComponent: undefined,
    });
  },
}));

// 辅助函数
function findComponentInTree(components: ComponentNode[], id: string): ComponentNode | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponentInTree(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeComponentFromTree(components: ComponentNode[], id: string): ComponentNode[] {
  return components.filter(comp => {
    if (comp.id === id) return false;
    if (comp.children) {
      comp.children = removeComponentFromTree(comp.children, id);
    }
    return true;
  });
}

function addComponentToTree(components: ComponentNode[], component: ComponentNode, parentId?: string): ComponentNode[] {
  if (!parentId) {
    return [...components, component];
  }

  return components.map(comp => {
    if (comp.id === parentId) {
      return {
        ...comp,
        children: [...(comp.children || []), component],
      };
    }
    if (comp.children) {
      return {
        ...comp,
        children: addComponentToTree(comp.children, component, parentId),
      };
    }
    return comp;
  });
}