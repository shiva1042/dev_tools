import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
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
  DragIndicator as DragIcon,
  ContentCopy as CopyIcon,
  KeyboardArrowUp as MoveUpIcon,
  KeyboardArrowDown as MoveDownIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import type { BuilderComponent, MUIComponentType, StyleProps } from '../../types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { getComponentDefinition } from '../../utils/componentDefinitions';

interface CanvasComponentProps {
  component: BuilderComponent;
  isNested?: boolean;
  index?: number;
  parentId?: string | null;
  showOutlines?: boolean;
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

export function CanvasComponent({ component, isNested = false, index = 0, parentId = null, showOutlines = true }: CanvasComponentProps) {
  const {
    selectedComponentId,
    selectComponent,
    removeComponent,
    duplicateComponent,
    moveComponentUp,
    moveComponentDown,
    toggleLockComponent,
    components,
  } = useBuilderStore();

  const isLocked = component.locked;
  const isGroup = component.isGroup;

  const isSelected = selectedComponentId === component.id;
  const definition = getComponentDefinition(component.type);

  // Sortable for drag and drop reordering
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: component.id,
    data: {
      type: 'canvas-item',
      componentId: component.id,
      componentType: component.type,
      parentId,
      index,
    },
  });

  // Droppable for receiving nested components
  const { setNodeRef: setDropRef, isOver: isDropOver } = useDroppable({
    id: `drop-${component.id}`,
    data: {
      type: 'component-drop-zone',
      componentId: component.id,
      acceptsChildren: definition?.canHaveChildren,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(component.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(component.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateComponent(component.id);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveComponentUp(component.id);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveComponentDown(component.id);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLockComponent(component.id);
  };

  // Check if component can move up/down
  const canMoveUp = index > 0;
  const canMoveDown = parentId
    ? true // For nested, we'd need to check parent's children
    : index < components.length - 1;

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
          ref={setDropRef}
          sx={{
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: isDropOver ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            color: isDropOver ? 'primary.main' : 'grey.500',
            fontSize: '0.75rem',
            p: 2,
            backgroundColor: isDropOver ? 'primary.50' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          <AddIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Drop components here
        </Box>
      );
    }
    return component.children.map((child, idx) => (
      <CanvasComponent
        key={child.id}
        component={child}
        isNested
        index={idx}
        parentId={component.id}
        showOutlines={showOutlines}
      />
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
      Box: (
        <Box
          ref={definition?.canHaveChildren ? setDropRef : undefined}
          sx={{
            minHeight: 50,
            ...combinedSx,
            backgroundColor: isDropOver ? 'primary.50' : (combinedSx.backgroundColor as string | undefined),
          }}
        >
          {renderChildren()}
        </Box>
      ),
      Stack: (
        <Stack
          ref={setDropRef}
          direction={props.direction as 'row' | 'column'}
          spacing={props.spacing as number}
          justifyContent={props.justifyContent as string}
          alignItems={props.alignItems as string}
          sx={{
            ...combinedSx,
            backgroundColor: isDropOver ? 'primary.50' : (combinedSx.backgroundColor as string | undefined),
          }}
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
        <Container
          ref={setDropRef}
          maxWidth={props.maxWidth as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false}
          sx={{
            ...combinedSx,
            backgroundColor: isDropOver ? 'primary.50' : (combinedSx.backgroundColor as string | undefined),
          }}
        >
          {renderChildren()}
        </Container>
      ),
      Card: (
        <Card
          ref={setDropRef}
          sx={{
            minWidth: 200,
            ...combinedSx,
            backgroundColor: isDropOver ? 'primary.50' : (combinedSx.backgroundColor as string | undefined),
          }}
        >
          {renderChildren()}
        </Card>
      ),
      Paper: (
        <Paper
          ref={setDropRef}
          elevation={props.elevation as number}
          variant={props.variant as 'elevation' | 'outlined'}
          sx={{
            ...combinedSx,
            backgroundColor: isDropOver ? 'primary.50' : (combinedSx.backgroundColor as string | undefined),
          }}
        >
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
      List: (
        <List
          ref={setDropRef}
          dense={props.dense as boolean}
          sx={{
            ...combinedSx,
            backgroundColor: isDropOver ? 'primary.50' : (combinedSx.backgroundColor as string | undefined),
          }}
        >
          {renderChildren()}
        </List>
      ),
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
      Group: (
        <Box
          ref={setDropRef}
          sx={{
            minHeight: 60,
            p: 1,
            border: '2px dashed',
            borderColor: isDropOver ? 'secondary.main' : 'secondary.200',
            borderRadius: 1,
            backgroundColor: isDropOver ? 'secondary.50' : 'rgba(156, 39, 176, 0.05)',
            ...combinedSx,
          }}
        >
          {component.children.length > 0 ? renderChildren() : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'secondary.main', py: 2 }}>
              <AddIcon sx={{ mr: 0.5 }} />
              <Typography variant="body2">Drop components in group</Typography>
            </Box>
          )}
        </Box>
      ),
    };

    return componentMap[type] || <Box sx={combinedSx}>Unknown: {type}</Box>;
  };

  // Get component dimensions from customStyles
  const customStyles = component.props.customStyles as StyleProps | undefined;
  const componentWidth = customStyles?.width;
  const componentHeight = customStyles?.height;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      sx={{
        position: 'relative',
        p: isNested ? 0.5 : 1,
        m: 0.5,
        border: showOutlines ? 2 : 0,
        borderColor: isDragging
          ? 'primary.dark'
          : isOver
            ? 'success.main'
            : isLocked
              ? 'warning.main'
              : isSelected
                ? 'primary.main'
                : 'transparent',
        borderStyle: isSelected || isDragging || isLocked ? 'solid' : 'dashed',
        borderRadius: 1,
        backgroundColor: isDragging
          ? 'primary.100'
          : isLocked
            ? 'rgba(255, 152, 0, 0.05)'
            : isSelected
              ? 'rgba(25, 118, 210, 0.08)'
              : 'transparent',
        width: componentWidth || 'auto',
        height: componentHeight || 'auto',
        minWidth: 50,
        minHeight: 30,
        flexShrink: 0,
        opacity: isDragging ? 0.7 : (isLocked ? 0.8 : 1),
        transform: isDragging ? 'scale(1.02)' : 'none',
        boxShadow: isDragging ? 4 : 0,
        transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        '&:hover': {
          borderColor: isLocked ? 'warning.main' : (isSelected ? 'primary.main' : 'grey.400'),
          backgroundColor: isLocked ? 'rgba(255, 152, 0, 0.05)' : (isSelected ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.02)'),
        },
      }}
    >
      {/* Drag Handle & Actions - Always visible on hover, more prominent when selected */}
      <Box
        sx={{
          position: 'absolute',
          top: -12,
          left: 4,
          right: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.15s ease',
          zIndex: 10,
          '.MuiBox-root:hover > &': {
            opacity: 1,
          },
        }}
      >
        {/* Drag Handle */}
        <Box
          {...(isLocked ? {} : { ...attributes, ...listeners })}
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isLocked ? 'warning.main' : (isGroup ? 'secondary.main' : 'primary.main'),
            color: 'white',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            fontSize: '0.7rem',
            cursor: isLocked ? 'not-allowed' : 'grab',
            userSelect: 'none',
            '&:active': {
              cursor: isLocked ? 'not-allowed' : 'grabbing',
            },
          }}
        >
          {isLocked ? (
            <LockIcon sx={{ fontSize: 14, mr: 0.5 }} />
          ) : isGroup ? (
            <GroupIcon sx={{ fontSize: 14, mr: 0.5 }} />
          ) : (
            <DragIcon sx={{ fontSize: 14, mr: 0.5 }} />
          )}
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
            {component.customName || component.groupName || component.type}
          </Typography>
        </Box>

        {/* Action Buttons */}
        {isSelected && (
          <Box sx={{ display: 'flex', gap: 0.25, ml: 'auto' }}>
            <Tooltip title="Move Up" arrow placement="top">
              <span>
                <IconButton
                  size="small"
                  onClick={handleMoveUp}
                  disabled={!canMoveUp}
                  sx={{
                    p: 0.25,
                    backgroundColor: 'grey.100',
                    '&:hover': { backgroundColor: 'grey.200' },
                  }}
                >
                  <MoveUpIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Move Down" arrow placement="top">
              <span>
                <IconButton
                  size="small"
                  onClick={handleMoveDown}
                  disabled={!canMoveDown}
                  sx={{
                    p: 0.25,
                    backgroundColor: 'grey.100',
                    '&:hover': { backgroundColor: 'grey.200' },
                  }}
                >
                  <MoveDownIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Duplicate" arrow placement="top">
              <IconButton
                size="small"
                onClick={handleDuplicate}
                disabled={isLocked}
                sx={{
                  p: 0.25,
                  backgroundColor: 'grey.100',
                  '&:hover': { backgroundColor: 'grey.200' },
                }}
              >
                <CopyIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isLocked ? 'Unlock' : 'Lock'} arrow placement="top">
              <IconButton
                size="small"
                onClick={handleToggleLock}
                sx={{
                  p: 0.25,
                  backgroundColor: isLocked ? 'warning.100' : 'grey.100',
                  color: isLocked ? 'warning.main' : 'inherit',
                  '&:hover': { backgroundColor: isLocked ? 'warning.200' : 'grey.200' },
                }}
              >
                {isLocked ? <LockIcon sx={{ fontSize: 14 }} /> : <UnlockIcon sx={{ fontSize: 14 }} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow placement="top">
              <IconButton
                size="small"
                onClick={handleDelete}
                disabled={isLocked}
                sx={{
                  p: 0.25,
                  backgroundColor: 'error.50',
                  color: 'error.main',
                  '&:hover': { backgroundColor: 'error.100' },
                }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Component Content */}
      <Box sx={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
        {renderMUIComponent()}
      </Box>

      {/* Drop indicator line - shows when dragging over */}
      {isOver && !isDragging && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -4,
            height: 4,
            backgroundColor: 'primary.main',
            borderRadius: 2,
          }}
        />
      )}
    </Box>
  );
}
