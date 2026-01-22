import { useState, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  Drawer,
  Typography,
  IconButton,
  Checkbox,
  Switch,
  Slider,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Container,
  FormControlLabel,
  Radio,
  RadioGroup,
  Rating,
  Badge,
  Alert,
  AlertTitle,
  LinearProgress,
  CircularProgress,
  Skeleton,
  Tooltip,
  Link,
  Breadcrumbs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import type { BuilderComponent, MUIComponentType, StyleProps } from '../../types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { getComponentDefinition } from '../../utils/componentDefinitions';

interface CanvasComponentProps {
  component: BuilderComponent;
  isNested?: boolean;
}

// Icon map for dynamic icon rendering
const iconComponents: Record<string, React.ReactNode> = {
  Home: <HomeIcon />,
  Menu: <MenuIcon />,
  Search: <SearchIcon />,
  Settings: <SettingsIcon />,
  Add: <AddIcon />,
  Delete: <DeleteIcon />,
  Edit: <EditIcon />,
  Close: <CloseIcon />,
  Check: <CheckIcon />,
  ArrowBack: <ArrowBackIcon />,
  ArrowForward: <ArrowForwardIcon />,
};

// Resize handle positions
type ResizeDirection = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw';

interface ResizeHandleProps {
  direction: ResizeDirection;
  onResizeStart: (e: React.MouseEvent, direction: ResizeDirection) => void;
}

function ResizeHandle({ direction, onResizeStart }: ResizeHandleProps) {
  const positionStyles: Record<ResizeDirection, React.CSSProperties> = {
    e: { right: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize', width: 8, height: 20 },
    w: { left: -4, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize', width: 8, height: 20 },
    s: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize', width: 20, height: 8 },
    n: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize', width: 20, height: 8 },
    se: { right: -4, bottom: -4, cursor: 'nwse-resize', width: 10, height: 10 },
    sw: { left: -4, bottom: -4, cursor: 'nesw-resize', width: 10, height: 10 },
    ne: { right: -4, top: -4, cursor: 'nesw-resize', width: 10, height: 10 },
    nw: { left: -4, top: -4, cursor: 'nwse-resize', width: 10, height: 10 },
  };

  return (
    <Box
      onMouseDown={(e) => onResizeStart(e, direction)}
      sx={{
        position: 'absolute',
        backgroundColor: 'primary.main',
        borderRadius: direction.length === 2 ? '50%' : 1,
        zIndex: 20,
        '&:hover': {
          backgroundColor: 'primary.dark',
        },
        ...positionStyles[direction],
      }}
    />
  );
}

export function CanvasComponent({ component, isNested = false }: CanvasComponentProps) {
  const { selectedComponentId, selectComponent, removeComponent, resizeComponent } = useBuilderStore();
  const isSelected = selectedComponentId === component.id;
  const definition = getComponentDefinition(component.type);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number; direction: ResizeDirection } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    data: {
      type: 'canvas-item',
      componentId: component.id,
    },
    disabled: isResizing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(component.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(component.id);
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    e.stopPropagation();
    e.preventDefault();

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
      direction,
    };
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const { x, y, width, height, direction } = resizeStartRef.current;
      const deltaX = moveEvent.clientX - x;
      const deltaY = moveEvent.clientY - y;

      let newWidth = width;
      let newHeight = height;

      // Calculate new dimensions based on direction
      if (direction.includes('e')) newWidth = Math.max(50, width + deltaX);
      if (direction.includes('w')) newWidth = Math.max(50, width - deltaX);
      if (direction.includes('s')) newHeight = Math.max(30, height + deltaY);
      if (direction.includes('n')) newHeight = Math.max(30, height - deltaY);

      resizeComponent(component.id, `${Math.round(newWidth)}px`, `${Math.round(newHeight)}px`);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [component.id, resizeComponent]);

  // Convert custom styles to sx-compatible object
  const getCustomSx = (): Record<string, unknown> => {
    const customStyles = component.props.customStyles as StyleProps | undefined;
    if (!customStyles) return {};

    const sx: Record<string, unknown> = {};
    Object.entries(customStyles).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        sx[key] = value;
      }
    });
    return sx;
  };

  const renderChildren = () => {
    if (component.children.length === 0 && definition?.canHaveChildren) {
      return (
        <Box
          sx={{
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed',
            borderColor: 'grey.400',
            borderRadius: 1,
            color: 'grey.500',
            fontSize: '0.75rem',
            p: 1,
          }}
        >
          Drop components here
        </Box>
      );
    }
    return component.children.map((child) => (
      <CanvasComponent key={child.id} component={child} isNested />
    ));
  };

  const getIcon = (iconName: string | undefined) => {
    if (!iconName) return null;
    return iconComponents[iconName] || <MenuIcon />;
  };

  const renderMUIComponent = () => {
    const { props, type } = component;
    const customSx = getCustomSx();
    const combinedSx = { ...customSx, ...(props.sx as Record<string, unknown> || {}) };

    // Handle options for Select component
    const selectOptions = (props.options as string[]) || ['Option 1', 'Option 2', 'Option 3'];

    const componentMap: Partial<Record<MUIComponentType, React.ReactNode>> = {
      Button: (
        <Button
          variant={props.variant as 'contained' | 'outlined' | 'text'}
          color={props.color as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'}
          size={props.size as 'small' | 'medium' | 'large'}
          disabled={props.disabled as boolean}
          fullWidth={props.fullWidth as boolean}
          startIcon={getIcon(props.startIcon as string)}
          endIcon={getIcon(props.endIcon as string)}
          sx={combinedSx}
        >
          {props.children as string || 'Button'}
          {component.children.length > 0 && renderChildren()}
        </Button>
      ),
      TextField: (
        <TextField
          label={props.label as string}
          placeholder={props.placeholder as string}
          defaultValue={props.defaultValue as string}
          helperText={props.helperText as string}
          variant={props.variant as 'outlined' | 'filled' | 'standard'}
          size={props.size as 'small' | 'medium'}
          type={props.type as string}
          disabled={props.disabled as boolean}
          required={props.required as boolean}
          error={props.error as boolean}
          fullWidth={props.fullWidth as boolean}
          multiline={props.multiline as boolean}
          rows={props.rows as number}
          sx={combinedSx}
        />
      ),
      Select: (
        <FormControl fullWidth={props.fullWidth as boolean} size={props.size as 'small' | 'medium'} sx={combinedSx}>
          <InputLabel>{props.label as string || 'Select'}</InputLabel>
          <Select label={props.label as string || 'Select'} defaultValue={props.defaultValue as string || ''}>
            {selectOptions.map((opt: string, idx: number) => (
              <MenuItem key={idx} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
      Checkbox: (
        <FormControlLabel
          control={
            <Checkbox
              defaultChecked={props.defaultChecked as boolean}
              color={props.color as 'primary' | 'secondary'}
              size={props.size as 'small' | 'medium'}
              disabled={props.disabled as boolean}
            />
          }
          label={props.label as string || 'Checkbox'}
          sx={combinedSx}
        />
      ),
      Switch: (
        <FormControlLabel
          control={
            <Switch
              defaultChecked={props.defaultChecked as boolean}
              color={props.color as 'primary' | 'secondary'}
              size={props.size as 'small' | 'medium'}
              disabled={props.disabled as boolean}
            />
          }
          label={props.label as string || 'Switch'}
          sx={combinedSx}
        />
      ),
      Slider: (
        <Box sx={{ width: '100%', px: 1, ...combinedSx }}>
          <Slider
            defaultValue={props.defaultValue as number || 50}
            min={props.min as number}
            max={props.max as number}
            step={props.step as number}
            marks={props.marks as boolean}
            valueLabelDisplay={props.valueLabelDisplay as 'auto' | 'on' | 'off'}
            color={props.color as 'primary' | 'secondary'}
            size={props.size as 'small' | 'medium'}
            disabled={props.disabled as boolean}
          />
        </Box>
      ),
      Rating: (
        <Rating
          defaultValue={props.defaultValue as number || 3}
          max={props.max as number || 5}
          precision={Number(props.precision) || 1}
          size={props.size as 'small' | 'medium' | 'large'}
          disabled={props.disabled as boolean}
          readOnly={props.readOnly as boolean}
          sx={combinedSx}
        />
      ),
      Radio: (
        <FormControlLabel
          control={<Radio color={props.color as 'primary' | 'secondary'} size={props.size as 'small' | 'medium'} />}
          label={props.label as string || 'Radio'}
          value={props.value as string}
          sx={combinedSx}
        />
      ),
      RadioGroup: (
        <RadioGroup row={props.row as boolean} defaultValue={props.defaultValue as string} sx={combinedSx}>
          {component.children.length > 0 ? renderChildren() : (
            <>
              <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
              <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
            </>
          )}
        </RadioGroup>
      ),
      Box: <Box sx={{ minHeight: 50, ...combinedSx }}>{renderChildren()}</Box>,
      Stack: (
        <Stack
          direction={props.direction as 'row' | 'column'}
          spacing={props.spacing as number}
          justifyContent={props.justifyContent as string}
          alignItems={props.alignItems as string}
          sx={combinedSx}
        >
          {renderChildren()}
        </Stack>
      ),
      Grid: (
        <Grid
          container={props.container as boolean}
          spacing={props.spacing as number}
          direction={props.direction as 'row' | 'column'}
          sx={combinedSx}
        >
          {renderChildren()}
        </Grid>
      ),
      GridItem: (
        <Box
          sx={{
            gridColumn: props.xs ? `span ${props.xs}` : undefined,
            ...combinedSx,
          }}
        >
          {renderChildren()}
        </Box>
      ),
      Container: (
        <Container maxWidth={props.maxWidth as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false} sx={combinedSx}>
          {renderChildren()}
        </Container>
      ),
      Card: <Card sx={{ minWidth: 200, ...combinedSx }}>{renderChildren()}</Card>,
      Paper: (
        <Paper elevation={props.elevation as number} variant={props.variant as 'elevation' | 'outlined'} sx={combinedSx}>
          {renderChildren()}
        </Paper>
      ),
      Divider: <Divider sx={combinedSx}>{props.children as string}</Divider>,
      Typography: (
        <Typography
          variant={props.variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2'}
          color={props.color as string}
          align={props.align as 'left' | 'center' | 'right'}
          gutterBottom={props.gutterBottom as boolean}
          noWrap={props.noWrap as boolean}
          sx={combinedSx}
        >
          {props.children as string || 'Text content'}
        </Typography>
      ),
      Avatar: (
        <Avatar src={props.src as string} alt={props.alt as string} variant={props.variant as 'circular' | 'rounded' | 'square'} sx={combinedSx}>
          {props.children as string || 'A'}
        </Avatar>
      ),
      Chip: (
        <Chip
          label={props.label as string || 'Chip'}
          variant={props.variant as 'filled' | 'outlined'}
          color={props.color as 'primary' | 'secondary'}
          size={props.size as 'small' | 'medium'}
          clickable={props.clickable as boolean}
          disabled={props.disabled as boolean}
          onDelete={props.onDelete ? () => {} : undefined}
          sx={combinedSx}
        />
      ),
      Badge: (
        <Badge
          badgeContent={props.badgeContent as string || 4}
          color={props.color as 'primary' | 'secondary' | 'error'}
          variant={props.variant as 'standard' | 'dot'}
          max={props.max as number}
          invisible={props.invisible as boolean}
          sx={combinedSx}
        >
          {component.children.length > 0 ? renderChildren() : <Avatar>B</Avatar>}
        </Badge>
      ),
      Alert: (
        <Alert
          severity={props.severity as 'error' | 'warning' | 'info' | 'success'}
          variant={props.variant as 'standard' | 'filled' | 'outlined'}
          onClose={props.onClose ? () => {} : undefined}
          sx={combinedSx}
        >
          {props.title ? <AlertTitle>{props.title as string}</AlertTitle> : null}
          {props.children as string || 'Alert message'}
        </Alert>
      ),
      LinearProgress: (
        <LinearProgress
          variant={props.variant as 'determinate' | 'indeterminate'}
          value={props.value as number}
          color={props.color as 'primary' | 'secondary'}
          sx={{ width: '100%', ...combinedSx }}
        />
      ),
      CircularProgress: (
        <CircularProgress
          variant={props.variant as 'determinate' | 'indeterminate'}
          value={props.value as number}
          size={props.size as number}
          thickness={props.thickness as number}
          color={props.color as 'primary' | 'secondary'}
          sx={combinedSx}
        />
      ),
      Skeleton: (
        <Skeleton
          variant={props.variant as 'text' | 'circular' | 'rectangular' | 'rounded'}
          width={props.width as number}
          height={props.height as number}
          animation={props.animation as 'pulse' | 'wave' | false}
          sx={combinedSx}
        />
      ),
      List: <List dense={props.dense as boolean} sx={combinedSx}>{renderChildren()}</List>,
      ListItem: (
        <ListItem divider={props.divider as boolean} sx={combinedSx}>
          <ListItemText
            primary={props.primaryText as string || 'List Item'}
            secondary={props.secondaryText as string}
          />
          {renderChildren()}
        </ListItem>
      ),
      AppBar: (
        <AppBar position="static" color={props.color as 'primary' | 'secondary'} sx={combinedSx}>
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              App Bar
            </Typography>
            {renderChildren()}
          </Toolbar>
        </AppBar>
      ),
      Tabs: (
        <Tabs
          value={props.value as number || 0}
          centered={props.centered as boolean}
          variant={props.variant as 'standard' | 'scrollable' | 'fullWidth'}
          sx={combinedSx}
        >
          {component.children.length > 0 ? renderChildren() : (
            <>
              <Tab label="Tab 1" />
              <Tab label="Tab 2" />
              <Tab label="Tab 3" />
            </>
          )}
        </Tabs>
      ),
      Tab: (
        <Tab
          label={props.label as string || 'Tab'}
          disabled={props.disabled as boolean}
          {...(props.icon ? { icon: getIcon(props.icon as string) as React.ReactElement } : {})}
        />
      ),
      Drawer: (
        <Box sx={{ position: 'relative', minHeight: 200, ...combinedSx }}>
          <Drawer variant="permanent" anchor={props.anchor as 'left' | 'right'} PaperProps={{ sx: { position: 'relative', width: 200 } }}>
            {renderChildren()}
          </Drawer>
        </Box>
      ),
      Link: (
        <Link
          href={props.href as string || '#'}
          color={props.color as string}
          underline={props.underline as 'always' | 'hover' | 'none'}
          target={props.target as string}
          sx={combinedSx}
        >
          {props.children as string || 'Link'}
        </Link>
      ),
      Breadcrumbs: (
        <Breadcrumbs separator={props.separator as string} maxItems={props.maxItems as number} sx={combinedSx}>
          {component.children.length > 0 ? renderChildren() : (
            <>
              <Link href="#">Home</Link>
              <Link href="#">Category</Link>
              <Typography>Current</Typography>
            </>
          )}
        </Breadcrumbs>
      ),
      IconButton: (
        <IconButton
          color={props.color as 'primary' | 'secondary'}
          size={props.size as 'small' | 'medium' | 'large'}
          disabled={props.disabled as boolean}
          sx={combinedSx}
        >
          {getIcon(props.icon as string) || <MenuIcon />}
        </IconButton>
      ),
      Dialog: (
        <Paper elevation={8} sx={{ p: 2, minWidth: 300, ...combinedSx }}>
          <Typography variant="h6" gutterBottom>
            {props.title as string || 'Dialog'}
          </Typography>
          {renderChildren()}
        </Paper>
      ),
      Tooltip: (
        <Tooltip title={props.title as string || 'Tooltip'} placement={props.placement as 'top' | 'bottom' | 'left' | 'right'} arrow={props.arrow as boolean}>
          <Box sx={combinedSx}>{component.children.length > 0 ? renderChildren() : <Button>Hover me</Button>}</Box>
        </Tooltip>
      ),
      Table: (
        <Table size={props.size as 'small' | 'medium'} sx={combinedSx}>
          <TableHead>
            <TableRow>
              <TableCell>Column 1</TableCell>
              <TableCell>Column 2</TableCell>
              <TableCell>Column 3</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Data 1</TableCell>
              <TableCell>Data 2</TableCell>
              <TableCell>Data 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ),
      Accordion: (
        <Accordion defaultExpanded={props.defaultExpanded as boolean} disabled={props.disabled as boolean} sx={combinedSx}>
          {component.children.length > 0 ? renderChildren() : (
            <>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Accordion Header</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>Accordion content goes here</Typography>
              </AccordionDetails>
            </>
          )}
        </Accordion>
      ),
      AccordionSummary: (
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={combinedSx}>
          {props.children as string || 'Summary'}
          {renderChildren()}
        </AccordionSummary>
      ),
      AccordionDetails: (
        <AccordionDetails sx={combinedSx}>
          {props.children as string}
          {renderChildren()}
        </AccordionDetails>
      ),
    };

    return componentMap[type] || <Box sx={combinedSx}>Unknown: {type}</Box>;
  };

  // Get component dimensions from customStyles
  const customStyles = component.props.customStyles as StyleProps | undefined;
  const componentWidth = customStyles?.width;
  const componentHeight = customStyles?.height;

  // Combine refs
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node);
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [setNodeRef]);

  return (
    <Box
      ref={setRefs}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      sx={{
        position: 'relative',
        p: isNested ? 0.5 : 1,
        m: 0.5,
        border: 2,
        borderColor: isSelected ? 'primary.main' : 'transparent',
        borderStyle: isSelected ? 'solid' : 'dashed',
        borderRadius: 1,
        cursor: isResizing ? 'default' : 'move',
        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        width: componentWidth || 'auto',
        height: componentHeight || 'auto',
        minWidth: 50,
        minHeight: 30,
        flexShrink: 0,
        '&:hover': {
          borderColor: isSelected ? 'primary.main' : 'grey.300',
          backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.02)',
        },
      }}
    >
      {isSelected && (
        <>
          {/* Component label */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              left: 8,
              backgroundColor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.7rem',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {component.customName || component.type}
            {componentWidth && componentHeight && (
              <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.8, fontSize: '0.6rem' }}>
                {componentWidth} × {componentHeight}
              </Typography>
            )}
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ color: 'white', p: 0, ml: 0.5 }}
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          {/* Resize handles */}
          <ResizeHandle direction="e" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="w" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="s" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="n" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="se" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="sw" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="ne" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="nw" onResizeStart={handleResizeStart} />
        </>
      )}
      {renderMUIComponent()}
    </Box>
  );
}
