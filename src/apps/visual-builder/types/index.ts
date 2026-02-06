export type MUIComponentType =
  | 'Button'
  | 'TextField'
  | 'Select'
  | 'Card'
  | 'Grid'
  | 'GridItem'
  | 'Box'
  | 'Stack'
  | 'Dialog'
  | 'Tabs'
  | 'Tab'
  | 'Table'
  | 'AppBar'
  | 'Drawer'
  | 'Typography'
  | 'IconButton'
  | 'Checkbox'
  | 'Switch'
  | 'Slider'
  | 'Avatar'
  | 'Chip'
  | 'Divider'
  | 'List'
  | 'ListItem'
  | 'Paper'
  | 'Container'
  | 'FormGroup'
  | 'FormControlLabel'
  | 'RadioGroup'
  | 'Radio'
  | 'Autocomplete'
  | 'Rating'
  | 'Badge'
  | 'Alert'
  | 'Snackbar'
  | 'LinearProgress'
  | 'CircularProgress'
  | 'Skeleton'
  | 'Tooltip'
  | 'Menu'
  | 'MenuItem'
  | 'Breadcrumbs'
  | 'Link'
  | 'Stepper'
  | 'Accordion'
  | 'AccordionSummary'
  | 'AccordionDetails'
  | 'ImageList'
  | 'ImageListItem'
  | 'Group';

export interface StyleProps {
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  padding?: string | number;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  margin?: string | number;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  backgroundColor?: string;
  color?: string;
  borderRadius?: string | number;
  borderWidth?: string | number;
  borderStyle?: string;
  borderColor?: string;
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  boxShadow?: string;
  opacity?: number;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string | number;
  flexWrap?: string;
  flex?: string | number;
  position?: string;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: number;
  overflow?: string;
  textAlign?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
}

// Event handler definitions
export interface EventHandler {
  event: 'onClick' | 'onChange' | 'onSubmit' | 'onFocus' | 'onBlur' | 'onMouseEnter' | 'onMouseLeave' | 'onKeyDown' | 'onKeyUp';
  action: 'console' | 'alert' | 'navigate' | 'setState' | 'custom';
  value: string;
}

export interface ComponentProps {
  [key: string]: unknown;
  customStyles?: StyleProps;
  customId?: string;
  customName?: string;
  customClassName?: string;
  eventHandlers?: EventHandler[];
}

export interface BuilderComponent {
  id: string;
  type: MUIComponentType;
  library: 'mui';
  props: ComponentProps;
  children: BuilderComponent[];
  customName?: string;
  customId?: string;
  isExpanded?: boolean;
  locked?: boolean;
  hidden?: boolean;
  isGroup?: boolean;
  groupName?: string;
}

export interface ComponentDefinition {
  type: MUIComponentType;
  label: string;
  category: 'inputs' | 'layout' | 'display' | 'navigation' | 'feedback' | 'data' | 'surfaces';
  defaultProps: ComponentProps;
  availableProps: PropDefinition[];
  canHaveChildren: boolean;
  acceptsChildren?: MUIComponentType[];
  description?: string;
  documentation?: string;
}

export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'backgroundColor'
  | 'dimension'
  | 'spacing'
  | 'sx'
  | 'multiSelect'
  | 'slider'
  | 'icon'
  | 'options'
  | 'eventHandlers';

export interface PropDefinition {
  name: string;
  type: PropType;
  label: string;
  options?: string[];
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  group?: 'basic' | 'style' | 'layout' | 'advanced' | 'events';
  description?: string;
}

export interface DragItem {
  type: 'palette-item' | 'canvas-item' | 'tree-item';
  componentType?: MUIComponentType;
  componentId?: string;
  parentId?: string | null;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface CanvasSettings {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showOutlines: boolean;
  zoom: number;
}

// Style Presets
export interface StylePreset {
  id: string;
  name: string;
  styles: StyleProps;
  category: 'buttons' | 'cards' | 'inputs' | 'layout' | 'typography' | 'custom';
}

// Template definitions
export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'forms' | 'layouts' | 'navigation' | 'dashboards' | 'cards' | 'auth';
  thumbnail?: string;
  components: BuilderComponent[];
}

// Project saving
export interface Project {
  id: string;
  name: string;
  description?: string;
  components: BuilderComponent[];
  stylePresets: StylePreset[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Version history
export interface VersionSnapshot {
  id: string;
  timestamp: string;
  description: string;
  components: BuilderComponent[];
}

// Viewport sizes for responsive preview
export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'custom';

export interface ViewportConfig {
  name: ViewportSize;
  width: number;
  height: number;
  label: string;
}

// Command palette action
export interface CommandAction {
  id: string;
  label: string;
  shortcut?: string;
  category: 'component' | 'edit' | 'view' | 'file' | 'help';
  action: () => void;
}

// Clipboard for copy/paste
export interface ClipboardData {
  components: BuilderComponent[];
  timestamp: number;
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
}

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'z', ctrl: true, action: 'undo', description: 'Undo last action' },
  { key: 'z', ctrl: true, shift: true, action: 'redo', description: 'Redo last action' },
  { key: 'y', ctrl: true, action: 'redo', description: 'Redo last action' },
  { key: 'c', ctrl: true, action: 'copy', description: 'Copy selected component' },
  { key: 'v', ctrl: true, action: 'paste', description: 'Paste component' },
  { key: 'x', ctrl: true, action: 'cut', description: 'Cut selected component' },
  { key: 'd', ctrl: true, action: 'duplicate', description: 'Duplicate selected component' },
  { key: 'Delete', action: 'delete', description: 'Delete selected component' },
  { key: 'Backspace', action: 'delete', description: 'Delete selected component' },
  { key: 'Escape', action: 'deselect', description: 'Deselect all' },
  { key: 'a', ctrl: true, action: 'selectAll', description: 'Select all components' },
  { key: 'g', ctrl: true, action: 'group', description: 'Group selected components' },
  { key: 'g', ctrl: true, shift: true, action: 'ungroup', description: 'Ungroup selected components' },
  { key: 'l', ctrl: true, action: 'lock', description: 'Lock/unlock selected component' },
  { key: 's', ctrl: true, action: 'save', description: 'Save project' },
  { key: 'k', ctrl: true, action: 'commandPalette', description: 'Open command palette' },
  { key: 'ArrowUp', action: 'moveUp', description: 'Move component up' },
  { key: 'ArrowDown', action: 'moveDown', description: 'Move component down' },
  { key: '+', ctrl: true, action: 'zoomIn', description: 'Zoom in' },
  { key: '-', ctrl: true, action: 'zoomOut', description: 'Zoom out' },
  { key: '0', ctrl: true, action: 'zoomReset', description: 'Reset zoom' },
];

// Default viewports
export const DEFAULT_VIEWPORTS: ViewportConfig[] = [
  { name: 'mobile', width: 375, height: 667, label: 'Mobile (375px)' },
  { name: 'tablet', width: 768, height: 1024, label: 'Tablet (768px)' },
  { name: 'desktop', width: 1280, height: 800, label: 'Desktop (1280px)' },
];

// Default style presets
export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  {
    id: 'primary-button',
    name: 'Primary Button',
    category: 'buttons',
    styles: {
      backgroundColor: '#1976d2',
      color: '#ffffff',
      padding: '10px 20px',
      borderRadius: 8,
    },
  },
  {
    id: 'outlined-button',
    name: 'Outlined Button',
    category: 'buttons',
    styles: {
      backgroundColor: 'transparent',
      color: '#1976d2',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#1976d2',
      padding: '10px 20px',
      borderRadius: 8,
    },
  },
  {
    id: 'card-elevated',
    name: 'Elevated Card',
    category: 'cards',
    styles: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      padding: 16,
    },
  },
  {
    id: 'card-flat',
    name: 'Flat Card',
    category: 'cards',
    styles: {
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      padding: 16,
    },
  },
  {
    id: 'flex-center',
    name: 'Flex Center',
    category: 'layout',
    styles: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  {
    id: 'flex-between',
    name: 'Flex Space Between',
    category: 'layout',
    styles: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  {
    id: 'flex-column',
    name: 'Flex Column',
    category: 'layout',
    styles: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
  },
  {
    id: 'text-heading',
    name: 'Heading',
    category: 'typography',
    styles: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.2,
    },
  },
  {
    id: 'text-body',
    name: 'Body Text',
    category: 'typography',
    styles: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  {
    id: 'input-rounded',
    name: 'Rounded Input',
    category: 'inputs',
    styles: {
      borderRadius: 20,
      padding: '8px 16px',
    },
  },
];
