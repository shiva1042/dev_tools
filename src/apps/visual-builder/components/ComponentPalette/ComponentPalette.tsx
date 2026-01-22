import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  SmartButton as ButtonIcon,
  TextFields as TextFieldIcon,
  ArrowDropDownCircle as SelectIcon,
  CreditCard as CardIcon,
  GridView as GridIcon,
  CheckBox as CheckboxIcon,
  Tab as TabIcon,
  TableChart as TableIcon,
  Web as AppBarIcon,
  Menu as DrawerIcon,
  TextFormat as TypographyIcon,
  ToggleOn as SwitchIcon,
  LinearScale as SliderIcon,
  AccountCircle as AvatarIcon,
  Label as ChipIcon,
  HorizontalRule as DividerIcon,
  List as ListIcon,
  ListAlt as ListItemIconMui,
  Article as PaperIcon,
  TouchApp as IconButtonIcon,
  OpenInNew as DialogIcon,
  ViewInAr as BoxIcon,
  ViewColumn as StackIcon,
  ViewModule as ContainerIcon,
  RadioButtonChecked as RadioIcon,
  Star as RatingIcon,
  NotificationsActive as BadgeIcon,
  Warning as AlertIcon,
  HourglassEmpty as ProgressIcon,
  Layers as SkeletonIcon,
  Info as TooltipIcon,
  Link as LinkIcon,
  Navigation as BreadcrumbsIcon,
  ExpandMore as AccordionIcon,
  GridOn as GridItemIcon,
} from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { componentDefinitions, getComponentsByCategory } from '../../utils/componentDefinitions';
import type { MUIComponentType } from '../../types';

const iconMap: Partial<Record<MUIComponentType, React.ReactNode>> = {
  Button: <ButtonIcon />,
  TextField: <TextFieldIcon />,
  Select: <SelectIcon />,
  Card: <CardIcon />,
  Grid: <GridIcon />,
  GridItem: <GridItemIcon />,
  Box: <BoxIcon />,
  Stack: <StackIcon />,
  Dialog: <DialogIcon />,
  Tabs: <TabIcon />,
  Tab: <TabIcon />,
  Table: <TableIcon />,
  AppBar: <AppBarIcon />,
  Drawer: <DrawerIcon />,
  Typography: <TypographyIcon />,
  IconButton: <IconButtonIcon />,
  Checkbox: <CheckboxIcon />,
  Switch: <SwitchIcon />,
  Slider: <SliderIcon />,
  Avatar: <AvatarIcon />,
  Chip: <ChipIcon />,
  Divider: <DividerIcon />,
  List: <ListIcon />,
  ListItem: <ListItemIconMui />,
  Paper: <PaperIcon />,
  Container: <ContainerIcon />,
  Radio: <RadioIcon />,
  RadioGroup: <RadioIcon />,
  Rating: <RatingIcon />,
  Badge: <BadgeIcon />,
  Alert: <AlertIcon />,
  LinearProgress: <ProgressIcon />,
  CircularProgress: <ProgressIcon />,
  Skeleton: <SkeletonIcon />,
  Tooltip: <TooltipIcon />,
  Link: <LinkIcon />,
  Breadcrumbs: <BreadcrumbsIcon />,
  Accordion: <AccordionIcon />,
  AccordionSummary: <AccordionIcon />,
  AccordionDetails: <AccordionIcon />,
};

interface DraggableComponentItemProps {
  type: MUIComponentType;
  label: string;
  description?: string;
}

function DraggableComponentItem({ type, label, description }: DraggableComponentItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: 'palette-item',
      componentType: type,
    },
  });

  return (
    <Tooltip title={description || label} placement="right" arrow>
      <ListItem disablePadding>
        <ListItemButton
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          sx={{
            opacity: isDragging ? 0.5 : 1,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            py: 0.75,
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {iconMap[type] || <BoxIcon />}
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
}

const categories = [
  { key: 'inputs', label: 'Inputs', color: '#1976d2' },
  { key: 'layout', label: 'Layout', color: '#9c27b0' },
  { key: 'display', label: 'Display', color: '#2e7d32' },
  { key: 'navigation', label: 'Navigation', color: '#ed6c02' },
  { key: 'feedback', label: 'Feedback', color: '#d32f2f' },
  { key: 'surfaces', label: 'Surfaces', color: '#0288d1' },
  { key: 'data', label: 'Data Display', color: '#7b1fa2' },
];

export function ComponentPalette() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<string[]>(['inputs', 'layout']);

  const filteredComponents = searchTerm
    ? componentDefinitions.filter(
        (def) =>
          def.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          def.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          def.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded((prev) =>
        isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)
      );
    };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Components
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Drag components to canvas
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredComponents ? (
          <Box sx={{ p: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              {filteredComponents.length} results
            </Typography>
            <List dense>
              {filteredComponents.map((def) => (
                <DraggableComponentItem
                  key={def.type}
                  type={def.type}
                  label={def.label}
                  description={def.description}
                />
              ))}
            </List>
          </Box>
        ) : (
          categories.map((category) => {
            const categoryComponents = getComponentsByCategory(category.key);
            if (categoryComponents.length === 0) return null;

            return (
              <Accordion
                key={category.key}
                expanded={expanded.includes(category.key)}
                onChange={handleAccordionChange(category.key)}
                disableGutters
                sx={{ '&:before': { display: 'none' } }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      gap: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: category.color,
                    }}
                  />
                  <Typography variant="subtitle2">{category.label}</Typography>
                  <Chip
                    label={categoryComponents.length}
                    size="small"
                    sx={{ height: 18, fontSize: '0.7rem', ml: 'auto', mr: 1 }}
                  />
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List dense>
                    {categoryComponents.map((def) => (
                      <DraggableComponentItem
                        key={def.type}
                        type={def.type}
                        label={def.label}
                        description={def.description}
                      />
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>
    </Box>
  );
}
