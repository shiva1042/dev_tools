import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  BuilderComponent,
  MUIComponentType,
  ComponentProps,
  StylePreset,
  Project,
  VersionSnapshot,
  ViewportSize,
  ClipboardData,
  Template,
} from '../types';
import { getComponentDefinition } from '../utils/componentDefinitions';
import { DEFAULT_STYLE_PRESETS } from '../types';

interface BuilderState {
  // Core state
  components: BuilderComponent[];
  selectedComponentId: string | null;
  selectedComponentIds: string[]; // Multi-select support
  codeFormat: 'tsx' | 'jsx' | 'jquery';
  canvasLayout: 'vertical' | 'horizontal' | 'wrap';

  // History
  history: BuilderComponent[][];
  historyIndex: number;

  // Canvas settings
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showOutlines: boolean;
  viewport: ViewportSize;
  customViewportWidth: number;
  customViewportHeight: number;

  // Project
  projectName: string;
  projectDescription: string;

  // Style presets
  stylePresets: StylePreset[];

  // Clipboard
  clipboard: ClipboardData | null;

  // Version snapshots
  versionSnapshots: VersionSnapshot[];

  // UI state
  showCommandPalette: boolean;
  showShortcutsPanel: boolean;
  searchQuery: string;

  // Actions - Core
  addComponent: (type: MUIComponentType, parentId?: string | null) => void;
  addComponentFromTemplate: (template: Template) => void;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: ComponentProps) => void;
  selectComponent: (id: string | null) => void;
  toggleComponentSelection: (id: string) => void;
  selectAllComponents: () => void;
  moveComponent: (dragId: string, hoverId: string) => void;
  moveComponentUp: (id: string) => void;
  moveComponentDown: (id: string) => void;
  duplicateComponent: (id: string) => void;
  setCodeFormat: (format: 'tsx' | 'jsx' | 'jquery') => void;
  clearCanvas: () => void;
  resizeComponent: (id: string, width: string | number, height: string | number) => void;
  setCanvasLayout: (layout: 'vertical' | 'horizontal' | 'wrap') => void;

  // Actions - History
  undo: () => void;
  redo: () => void;

  // Actions - Lock/Unlock
  lockComponent: (id: string) => void;
  unlockComponent: (id: string) => void;
  toggleLockComponent: (id: string) => void;

  // Actions - Grouping
  groupComponents: (ids: string[]) => void;
  ungroupComponent: (id: string) => void;

  // Actions - Copy/Paste
  copyComponent: (id: string) => void;
  copyComponents: (ids: string[]) => void;
  cutComponent: (id: string) => void;
  pasteComponents: (parentId?: string | null) => void;

  // Actions - Canvas settings
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setShowOutlines: (show: boolean) => void;
  setViewport: (viewport: ViewportSize) => void;
  setCustomViewport: (width: number, height: number) => void;

  // Actions - Style presets
  addStylePreset: (preset: Omit<StylePreset, 'id'>) => void;
  removeStylePreset: (id: string) => void;
  applyStylePreset: (componentId: string, presetId: string) => void;

  // Actions - Project
  setProjectName: (name: string) => void;
  setProjectDescription: (description: string) => void;
  saveProject: () => Project;
  loadProject: (project: Project) => void;
  exportProjectJSON: () => string;
  importProjectJSON: (json: string) => boolean;

  // Actions - Version snapshots
  createSnapshot: (description: string) => void;
  restoreSnapshot: (id: string) => void;
  deleteSnapshot: (id: string) => void;

  // Actions - UI
  setShowCommandPalette: (show: boolean) => void;
  toggleCommandPalette: () => void;
  setShowShortcutsPanel: (show: boolean) => void;
  toggleShortcutsPanel: () => void;
  setSearchQuery: (query: string) => void;

  // Getters
  getSelectedComponent: () => BuilderComponent | null;
  getSelectedComponents: () => BuilderComponent[];
  findComponentById: (id: string) => BuilderComponent | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getFilteredComponents: (query: string) => BuilderComponent[];
}

// Helper: Deep clone a component with new IDs
const deepCloneComponent = (component: BuilderComponent): BuilderComponent => {
  return {
    ...component,
    id: uuidv4(),
    children: component.children.map(deepCloneComponent),
  };
};

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

const findParentAndIndex = (
  components: BuilderComponent[],
  id: string,
  parent: BuilderComponent | null = null
): { parent: BuilderComponent | null; index: number; siblings: BuilderComponent[] } | null => {
  for (let i = 0; i < components.length; i++) {
    if (components[i].id === id) {
      return { parent, index: i, siblings: components };
    }
    if (components[i].children.length > 0) {
      const result = findParentAndIndex(components[i].children, id, components[i]);
      if (result) return result;
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

const updateComponentInTree = (
  components: BuilderComponent[],
  id: string,
  updates: Partial<BuilderComponent>
): BuilderComponent[] => {
  return components.map(comp => {
    if (comp.id === id) {
      return { ...comp, ...updates };
    }
    if (comp.children.length > 0) {
      return { ...comp, children: updateComponentInTree(comp.children, id, updates) };
    }
    return comp;
  });
};

const swapComponents = (
  components: BuilderComponent[],
  id: string,
  direction: 'up' | 'down'
): BuilderComponent[] => {
  const index = components.findIndex(c => c.id === id);
  if (index === -1) {
    return components.map(comp => ({
      ...comp,
      children: comp.children.length > 0
        ? swapComponents(comp.children, id, direction)
        : comp.children,
    }));
  }

  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= components.length) {
    return components;
  }

  const newComponents = [...components];
  [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
  return newComponents;
};

const getAllComponentIds = (components: BuilderComponent[]): string[] => {
  const ids: string[] = [];
  for (const comp of components) {
    ids.push(comp.id);
    if (comp.children.length > 0) {
      ids.push(...getAllComponentIds(comp.children));
    }
  }
  return ids;
};

const filterComponentsByQuery = (
  components: BuilderComponent[],
  query: string
): BuilderComponent[] => {
  const lowerQuery = query.toLowerCase();
  const results: BuilderComponent[] = [];

  const searchInComponents = (comps: BuilderComponent[]) => {
    for (const comp of comps) {
      if (
        comp.type.toLowerCase().includes(lowerQuery) ||
        comp.customName?.toLowerCase().includes(lowerQuery) ||
        comp.id.toLowerCase().includes(lowerQuery)
      ) {
        results.push(comp);
      }
      if (comp.children.length > 0) {
        searchInComponents(comp.children);
      }
    }
  };

  searchInComponents(components);
  return results;
};

const MAX_HISTORY = 50;
const STORAGE_KEY = 'visual-builder-state';

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      // Initial state
      components: [],
      selectedComponentId: null,
      selectedComponentIds: [],
      codeFormat: 'tsx',
      canvasLayout: 'wrap',
      history: [[]],
      historyIndex: 0,

      // Canvas settings
      zoom: 100,
      showGrid: false,
      snapToGrid: false,
      gridSize: 8,
      showOutlines: true,
      viewport: 'desktop',
      customViewportWidth: 1280,
      customViewportHeight: 800,

      // Project
      projectName: 'Untitled Project',
      projectDescription: '',

      // Style presets
      stylePresets: [...DEFAULT_STYLE_PRESETS],

      // Clipboard
      clipboard: null,

      // Version snapshots
      versionSnapshots: [],

      // UI state
      showCommandPalette: false,
      showShortcutsPanel: false,
      searchQuery: '',

      // Core actions
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
          let newComponents: BuilderComponent[];
          if (parentId) {
            newComponents = addToParent(state.components, parentId, newComponent);
          } else {
            newComponents = [...state.components, newComponent];
          }

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            selectedComponentId: newComponent.id,
            selectedComponentIds: [newComponent.id],
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      addComponentFromTemplate: (template: Template) => {
        set(state => {
          const clonedComponents = template.components.map(deepCloneComponent);
          const newComponents = [...state.components, ...clonedComponents];

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      removeComponent: (id: string) => {
        set(state => {
          const component = findComponentInTree(state.components, id);
          if (component?.locked) return state;

          const { components } = findAndRemoveComponent([...state.components], id);

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(components)));

          return {
            components,
            selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
            selectedComponentIds: state.selectedComponentIds.filter(sid => sid !== id),
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      updateComponentProps: (id: string, props: ComponentProps) => {
        set(state => {
          const component = findComponentInTree(state.components, id);
          if (component?.locked) return state;

          const newComponents = updatePropsInTree(state.components, id, props);

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      selectComponent: (id: string | null) => {
        set({
          selectedComponentId: id,
          selectedComponentIds: id ? [id] : [],
        });
      },

      toggleComponentSelection: (id: string) => {
        set(state => {
          const isSelected = state.selectedComponentIds.includes(id);
          const newIds = isSelected
            ? state.selectedComponentIds.filter(sid => sid !== id)
            : [...state.selectedComponentIds, id];

          return {
            selectedComponentIds: newIds,
            selectedComponentId: newIds.length === 1 ? newIds[0] : (newIds.length === 0 ? null : state.selectedComponentId),
          };
        });
      },

      selectAllComponents: () => {
        set(state => {
          const allIds = getAllComponentIds(state.components);
          return {
            selectedComponentIds: allIds,
            selectedComponentId: allIds.length === 1 ? allIds[0] : null,
          };
        });
      },

      moveComponent: (dragId: string, hoverId: string) => {
        set(state => {
          const dragComponent = findComponentInTree(state.components, dragId);
          if (dragComponent?.locked) return state;

          const components = [...state.components];
          const dragIndex = components.findIndex(c => c.id === dragId);
          const hoverIndex = components.findIndex(c => c.id === hoverId);

          if (dragIndex === -1 || hoverIndex === -1) return state;

          const [draggedItem] = components.splice(dragIndex, 1);
          components.splice(hoverIndex, 0, draggedItem);

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(components)));

          return {
            components,
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      moveComponentUp: (id: string) => {
        set(state => {
          const component = findComponentInTree(state.components, id);
          if (component?.locked) return state;

          const newComponents = swapComponents([...state.components], id, 'up');

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      moveComponentDown: (id: string) => {
        set(state => {
          const component = findComponentInTree(state.components, id);
          if (component?.locked) return state;

          const newComponents = swapComponents([...state.components], id, 'down');

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      duplicateComponent: (id: string) => {
        set(state => {
          const component = findComponentInTree(state.components, id);
          if (!component) return state;

          const cloned = deepCloneComponent(component);
          const parentInfo = findParentAndIndex(state.components, id);
          if (!parentInfo) return state;

          let newComponents: BuilderComponent[];
          if (parentInfo.parent) {
            newComponents = state.components.map(comp => {
              if (comp.id === parentInfo.parent!.id) {
                const children = [...comp.children];
                children.splice(parentInfo.index + 1, 0, cloned);
                return { ...comp, children };
              }
              return comp;
            });
          } else {
            newComponents = [...state.components];
            newComponents.splice(parentInfo.index + 1, 0, cloned);
          }

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            selectedComponentId: cloned.id,
            selectedComponentIds: [cloned.id],
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      setCodeFormat: (format: 'tsx' | 'jsx' | 'jquery') => {
        set({ codeFormat: format });
      },

      clearCanvas: () => {
        set(state => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push([]);

          return {
            components: [],
            selectedComponentId: null,
            selectedComponentIds: [],
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      resizeComponent: (id: string, width: string | number, height: string | number) => {
        set(state => {
          const component = findComponentInTree(state.components, id);
          if (component?.locked) return state;

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
                      width,
                      height,
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

      // History actions
      undo: () => {
        set(state => {
          if (state.historyIndex <= 0) return state;
          const newIndex = state.historyIndex - 1;
          return {
            components: JSON.parse(JSON.stringify(state.history[newIndex])),
            historyIndex: newIndex,
            selectedComponentId: null,
            selectedComponentIds: [],
          };
        });
      },

      redo: () => {
        set(state => {
          if (state.historyIndex >= state.history.length - 1) return state;
          const newIndex = state.historyIndex + 1;
          return {
            components: JSON.parse(JSON.stringify(state.history[newIndex])),
            historyIndex: newIndex,
            selectedComponentId: null,
            selectedComponentIds: [],
          };
        });
      },

      // Lock/Unlock actions
      lockComponent: (id: string) => {
        set(state => ({
          components: updateComponentInTree(state.components, id, { locked: true }),
        }));
      },

      unlockComponent: (id: string) => {
        set(state => ({
          components: updateComponentInTree(state.components, id, { locked: false }),
        }));
      },

      toggleLockComponent: (id: string) => {
        set(state => {
          const component = findComponentInTree(state.components, id);
          if (!component) return state;
          return {
            components: updateComponentInTree(state.components, id, { locked: !component.locked }),
          };
        });
      },

      // Grouping actions
      groupComponents: (ids: string[]) => {
        if (ids.length < 2) return;

        set(state => {
          const componentsToGroup: BuilderComponent[] = [];
          let newComponents = [...state.components];

          // Find and remove all components to be grouped
          for (const id of ids) {
            const result = findAndRemoveComponent(newComponents, id);
            if (result.removed) {
              componentsToGroup.push(result.removed);
              newComponents = result.components;
            }
          }

          if (componentsToGroup.length < 2) return state;

          // Create group component
          const groupComponent: BuilderComponent = {
            id: uuidv4(),
            type: 'Group',
            library: 'mui',
            props: {},
            children: componentsToGroup,
            isGroup: true,
            groupName: 'Group',
          };

          newComponents.push(groupComponent);

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            selectedComponentId: groupComponent.id,
            selectedComponentIds: [groupComponent.id],
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      ungroupComponent: (id: string) => {
        set(state => {
          const component = findComponentInTree(state.components, id);
          if (!component?.isGroup) return state;

          const parentInfo = findParentAndIndex(state.components, id);
          if (!parentInfo) return state;

          let newComponents: BuilderComponent[];

          if (parentInfo.parent) {
            // Nested group
            newComponents = state.components.map(comp => {
              if (comp.id === parentInfo.parent!.id) {
                const children = [...comp.children];
                children.splice(parentInfo.index, 1, ...component.children);
                return { ...comp, children };
              }
              return comp;
            });
          } else {
            // Root level group
            newComponents = [...state.components];
            newComponents.splice(parentInfo.index, 1, ...component.children);
          }

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            selectedComponentId: null,
            selectedComponentIds: component.children.map(c => c.id),
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      // Copy/Paste actions
      copyComponent: (id: string) => {
        const component = get().findComponentById(id);
        if (!component) return;

        set({
          clipboard: {
            components: [JSON.parse(JSON.stringify(component))],
            timestamp: Date.now(),
          },
        });
      },

      copyComponents: (ids: string[]) => {
        const components: BuilderComponent[] = [];
        for (const id of ids) {
          const component = get().findComponentById(id);
          if (component) {
            components.push(JSON.parse(JSON.stringify(component)));
          }
        }

        if (components.length > 0) {
          set({
            clipboard: {
              components,
              timestamp: Date.now(),
            },
          });
        }
      },

      cutComponent: (id: string) => {
        const component = get().findComponentById(id);
        if (!component || component.locked) return;

        set(state => {
          const { components } = findAndRemoveComponent([...state.components], id);

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(components)));

          return {
            components,
            clipboard: {
              components: [JSON.parse(JSON.stringify(component))],
              timestamp: Date.now(),
            },
            selectedComponentId: null,
            selectedComponentIds: [],
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      pasteComponents: (parentId?: string | null) => {
        const { clipboard } = get();
        if (!clipboard || clipboard.components.length === 0) return;

        set(state => {
          const clonedComponents = clipboard.components.map(deepCloneComponent);

          let newComponents: BuilderComponent[];
          if (parentId) {
            newComponents = state.components;
            for (const cloned of clonedComponents) {
              newComponents = addToParent(newComponents, parentId, cloned);
            }
          } else {
            newComponents = [...state.components, ...clonedComponents];
          }

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            selectedComponentIds: clonedComponents.map(c => c.id),
            selectedComponentId: clonedComponents.length === 1 ? clonedComponents[0].id : null,
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      // Canvas settings actions
      setZoom: (zoom: number) => {
        set({ zoom: Math.min(Math.max(zoom, 25), 200) });
      },

      zoomIn: () => {
        set(state => ({ zoom: Math.min(state.zoom + 10, 200) }));
      },

      zoomOut: () => {
        set(state => ({ zoom: Math.max(state.zoom - 10, 25) }));
      },

      resetZoom: () => {
        set({ zoom: 100 });
      },

      setShowGrid: (show: boolean) => {
        set({ showGrid: show });
      },

      setSnapToGrid: (snap: boolean) => {
        set({ snapToGrid: snap });
      },

      setGridSize: (size: number) => {
        set({ gridSize: size });
      },

      setShowOutlines: (show: boolean) => {
        set({ showOutlines: show });
      },

      setViewport: (viewport: ViewportSize) => {
        set({ viewport });
      },

      setCustomViewport: (width: number, height: number) => {
        set({
          viewport: 'custom',
          customViewportWidth: width,
          customViewportHeight: height,
        });
      },

      // Style presets actions
      addStylePreset: (preset: Omit<StylePreset, 'id'>) => {
        set(state => ({
          stylePresets: [...state.stylePresets, { ...preset, id: uuidv4() }],
        }));
      },

      removeStylePreset: (id: string) => {
        set(state => ({
          stylePresets: state.stylePresets.filter(p => p.id !== id),
        }));
      },

      applyStylePreset: (componentId: string, presetId: string) => {
        const preset = get().stylePresets.find(p => p.id === presetId);
        if (!preset) return;

        set(state => {
          const newComponents = updatePropsInTree(state.components, componentId, {
            customStyles: preset.styles,
          });

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(newComponents)));

          return {
            components: newComponents,
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
          };
        });
      },

      // Project actions
      setProjectName: (name: string) => {
        set({ projectName: name });
      },

      setProjectDescription: (description: string) => {
        set({ projectDescription: description });
      },

      saveProject: () => {
        const state = get();
        const project: Project = {
          id: uuidv4(),
          name: state.projectName,
          description: state.projectDescription,
          components: state.components,
          stylePresets: state.stylePresets,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        };
        return project;
      },

      loadProject: (project: Project) => {
        set(state => {
          const newHistory = [[...project.components]];
          return {
            components: project.components,
            projectName: project.name,
            projectDescription: project.description || '',
            stylePresets: project.stylePresets || [...DEFAULT_STYLE_PRESETS],
            history: newHistory,
            historyIndex: 0,
            selectedComponentId: null,
            selectedComponentIds: [],
          };
        });
      },

      exportProjectJSON: () => {
        const project = get().saveProject();
        return JSON.stringify(project, null, 2);
      },

      importProjectJSON: (json: string) => {
        try {
          const project = JSON.parse(json) as Project;
          get().loadProject(project);
          return true;
        } catch {
          return false;
        }
      },

      // Version snapshots actions
      createSnapshot: (description: string) => {
        set(state => ({
          versionSnapshots: [
            ...state.versionSnapshots,
            {
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              description,
              components: JSON.parse(JSON.stringify(state.components)),
            },
          ],
        }));
      },

      restoreSnapshot: (id: string) => {
        set(state => {
          const snapshot = state.versionSnapshots.find(s => s.id === id);
          if (!snapshot) return state;

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(snapshot.components)));

          return {
            components: JSON.parse(JSON.stringify(snapshot.components)),
            history: newHistory.slice(-MAX_HISTORY),
            historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
            selectedComponentId: null,
            selectedComponentIds: [],
          };
        });
      },

      deleteSnapshot: (id: string) => {
        set(state => ({
          versionSnapshots: state.versionSnapshots.filter(s => s.id !== id),
        }));
      },

      // UI actions
      setShowCommandPalette: (show: boolean) => {
        set({ showCommandPalette: show });
      },

      toggleCommandPalette: () => {
        set(state => ({ showCommandPalette: !state.showCommandPalette }));
      },

      setShowShortcutsPanel: (show: boolean) => {
        set({ showShortcutsPanel: show });
      },

      toggleShortcutsPanel: () => {
        set(state => ({ showShortcutsPanel: !state.showShortcutsPanel }));
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // Getters
      getSelectedComponent: () => {
        const { components, selectedComponentId } = get();
        if (!selectedComponentId) return null;
        return findComponentInTree(components, selectedComponentId);
      },

      getSelectedComponents: () => {
        const { components, selectedComponentIds } = get();
        return selectedComponentIds
          .map(id => findComponentInTree(components, id))
          .filter((c): c is BuilderComponent => c !== null);
      },

      findComponentById: (id: string) => {
        return findComponentInTree(get().components, id);
      },

      canUndo: () => {
        return get().historyIndex > 0;
      },

      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },

      getFilteredComponents: (query: string) => {
        return filterComponentsByQuery(get().components, query);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        components: state.components,
        projectName: state.projectName,
        projectDescription: state.projectDescription,
        stylePresets: state.stylePresets,
        versionSnapshots: state.versionSnapshots,
        codeFormat: state.codeFormat,
        canvasLayout: state.canvasLayout,
        zoom: state.zoom,
        showGrid: state.showGrid,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
        showOutlines: state.showOutlines,
        viewport: state.viewport,
      }),
    }
  )
);
