import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { BuilderComponent, MUIComponentType, ComponentProps } from '../types';
import { getComponentDefinition } from '../utils/componentDefinitions';

interface BuilderState {
  components: BuilderComponent[];
  selectedComponentId: string | null;
  codeFormat: 'tsx' | 'jsx' | 'jquery';
  canvasLayout: 'vertical' | 'horizontal' | 'wrap';

  // Actions
  addComponent: (type: MUIComponentType, parentId?: string | null) => void;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: ComponentProps) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (dragId: string, hoverId: string) => void;
  setCodeFormat: (format: 'tsx' | 'jsx' | 'jquery') => void;
  clearCanvas: () => void;
  resizeComponent: (id: string, width: string | number, height: string | number) => void;
  setCanvasLayout: (layout: 'vertical' | 'horizontal' | 'wrap') => void;

  // Getters
  getSelectedComponent: () => BuilderComponent | null;
  findComponentById: (id: string) => BuilderComponent | null;
}

const findAndRemoveComponent = (
  components: BuilderComponent[],
  id: string
): { components: BuilderComponent[]; removed: BuilderComponent | null } => {
  let removed: BuilderComponent | null = null;

  const newComponents = components.filter(comp => {
    if (comp.id === id) {
      removed = comp;
      return false;
    }
    return true;
  });

  if (!removed) {
    for (const comp of newComponents) {
      if (comp.children.length > 0) {
        const result = findAndRemoveComponent(comp.children, id);
        if (result.removed) {
          comp.children = result.components;
          removed = result.removed;
          break;
        }
      }
    }
  }

  return { components: newComponents, removed };
};

const findComponentInTree = (
  components: BuilderComponent[],
  id: string
): BuilderComponent | null => {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children.length > 0) {
      const found = findComponentInTree(comp.children, id);
      if (found) return found;
    }
  }
  return null;
};

const addToParent = (
  components: BuilderComponent[],
  parentId: string,
  newComponent: BuilderComponent
): BuilderComponent[] => {
  return components.map(comp => {
    if (comp.id === parentId) {
      return { ...comp, children: [...comp.children, newComponent] };
    }
    if (comp.children.length > 0) {
      return { ...comp, children: addToParent(comp.children, parentId, newComponent) };
    }
    return comp;
  });
};

const updatePropsInTree = (
  components: BuilderComponent[],
  id: string,
  props: ComponentProps
): BuilderComponent[] => {
  return components.map(comp => {
    if (comp.id === id) {
      return { ...comp, props: { ...comp.props, ...props } };
    }
    if (comp.children.length > 0) {
      return { ...comp, children: updatePropsInTree(comp.children, id, props) };
    }
    return comp;
  });
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  components: [],
  selectedComponentId: null,
  codeFormat: 'tsx',
  canvasLayout: 'wrap',

  addComponent: (type: MUIComponentType, parentId?: string | null) => {
    const definition = getComponentDefinition(type);
    if (!definition) return;

    const newComponent: BuilderComponent = {
      id: uuidv4(),
      type,
      library: 'mui',
      props: { ...definition.defaultProps },
      children: [],
    };

    set(state => {
      if (parentId) {
        return { components: addToParent(state.components, parentId, newComponent) };
      }
      return { components: [...state.components, newComponent] };
    });
  },

  removeComponent: (id: string) => {
    set(state => {
      const { components } = findAndRemoveComponent([...state.components], id);
      return {
        components,
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
      };
    });
  },

  updateComponentProps: (id: string, props: ComponentProps) => {
    set(state => ({
      components: updatePropsInTree(state.components, id, props)
    }));
  },

  selectComponent: (id: string | null) => {
    set({ selectedComponentId: id });
  },

  moveComponent: (dragId: string, hoverId: string) => {
    set(state => {
      const components = [...state.components];
      const dragIndex = components.findIndex(c => c.id === dragId);
      const hoverIndex = components.findIndex(c => c.id === hoverId);

      if (dragIndex === -1 || hoverIndex === -1) return state;

      const [draggedItem] = components.splice(dragIndex, 1);
      components.splice(hoverIndex, 0, draggedItem);

      return { components };
    });
  },

  setCodeFormat: (format: 'tsx' | 'jsx' | 'jquery') => {
    set({ codeFormat: format });
  },

  clearCanvas: () => {
    set({ components: [], selectedComponentId: null });
  },

  resizeComponent: (id: string, width: string | number, height: string | number) => {
    set(state => {
      const updateSize = (components: BuilderComponent[]): BuilderComponent[] => {
        return components.map(comp => {
          if (comp.id === id) {
            const customStyles = (comp.props.customStyles as Record<string, unknown>) || {};
            return {
              ...comp,
              props: {
                ...comp.props,
                customStyles: {
                  ...customStyles,
                  width: width,
                  height: height,
                },
              },
            };
          }
          if (comp.children.length > 0) {
            return { ...comp, children: updateSize(comp.children) };
          }
          return comp;
        });
      };
      return { components: updateSize(state.components) };
    });
  },

  setCanvasLayout: (layout: 'vertical' | 'horizontal' | 'wrap') => {
    set({ canvasLayout: layout });
  },

  getSelectedComponent: () => {
    const { components, selectedComponentId } = get();
    if (!selectedComponentId) return null;
    return findComponentInTree(components, selectedComponentId);
  },

  findComponentById: (id: string) => {
    return findComponentInTree(get().components, id);
  },
}));
