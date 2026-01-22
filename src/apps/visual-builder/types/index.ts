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
  | 'ImageListItem';

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

export interface ComponentProps {
  [key: string]: unknown;
  customStyles?: StyleProps;
  customId?: string;
  customName?: string;
  customClassName?: string;
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
  | 'options';

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
