import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Slider,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Popover,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ColorLens as ColorIcon,
} from '@mui/icons-material';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useBuilderStore } from '../../store/useBuilderStore';
import { getComponentDefinition } from '../../utils/componentDefinitions';
import type { PropDefinition } from '../../types';

// Color Picker Component
interface ColorPickerFieldProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

function ColorPickerField({ value, onChange, label }: ColorPickerFieldProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Pick color">
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: value || '#ffffff',
              border: '2px solid',
              borderColor: 'divider',
              '&:hover': { backgroundColor: value || '#f0f0f0' },
            }}
          >
            <ColorIcon sx={{ color: value ? getContrastColor(value) : 'grey' }} />
          </IconButton>
        </Tooltip>
        <TextField
          size="small"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          sx={{ flex: 1 }}
        />
        {value && (
          <IconButton size="small" onClick={() => onChange('')}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker color={value || '#000000'} onChange={onChange} />
          <Box sx={{ mt: 1 }}>
            <HexColorInput
              color={value || '#000000'}
              onChange={onChange}
              prefixed
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </Box>
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#d32f2f', '#0288d1', '#000000', '#ffffff'].map((c) => (
              <Box
                key={c}
                onClick={() => onChange(c)}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: c,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Dimension Input Component
interface DimensionInputProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  label: string;
}

function DimensionInput({ value, onChange, label }: DimensionInputProps) {
  const [inputValue, setInputValue] = useState(String(value || ''));

  useEffect(() => {
    setInputValue(String(value || ''));
  }, [value]);

  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder="auto, 100px, 50%"
      sx={{ mb: 2 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {['px', '%', 'rem', 'auto'].map((unit) => (
                <Chip
                  key={unit}
                  label={unit}
                  size="small"
                  onClick={() => {
                    if (unit === 'auto') {
                      onChange('auto');
                      setInputValue('auto');
                    } else {
                      const numValue = parseInt(inputValue) || 0;
                      onChange(`${numValue}${unit}`);
                      setInputValue(`${numValue}${unit}`);
                    }
                  }}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </InputAdornment>
        ),
      }}
    />
  );
}

// Options Editor Component
interface OptionsEditorProps {
  value: string[];
  onChange: (options: string[]) => void;
  label: string;
}

function OptionsEditor({ value, onChange, label }: OptionsEditorProps) {
  const [newOption, setNewOption] = useState('');
  const options = value || [];

  const handleAdd = () => {
    if (newOption.trim()) {
      onChange([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Add option..."
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          sx={{ flex: 1 }}
        />
        <IconButton size="small" onClick={handleAdd} color="primary">
          <AddIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {options.map((opt, i) => (
          <Chip
            key={i}
            label={opt}
            size="small"
            onDelete={() => handleRemove(i)}
          />
        ))}
      </Box>
    </Box>
  );
}

export function PropertiesPanel() {
  const { selectedComponentId, updateComponentProps, findComponentById } = useBuilderStore();
  const selectedComponent = selectedComponentId ? findComponentById(selectedComponentId) : null;
  const [sxValue, setSxValue] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'style']);

  useEffect(() => {
    if (selectedComponent?.props?.sx) {
      setSxValue(JSON.stringify(selectedComponent.props.sx, null, 2));
    } else {
      setSxValue('{}');
    }
  }, [selectedComponent]);

  const handleSectionToggle = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const getNestedValue = useCallback((obj: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }, []);

  const setNestedValue = useCallback((obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> => {
    const keys = path.split('.');
    const result = { ...obj };
    let current: Record<string, unknown> = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = current[key] ? { ...(current[key] as Record<string, unknown>) } : {};
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    return result;
  }, []);

  if (!selectedComponent) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Properties</Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Select a component on the canvas to edit its properties
          </Typography>
        </Box>
      </Box>
    );
  }

  const definition = getComponentDefinition(selectedComponent.type);
  if (!definition) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Unknown component type</Alert>
      </Box>
    );
  }

  const handlePropChange = (propName: string, value: unknown) => {
    if (propName.includes('.')) {
      const newProps = setNestedValue(selectedComponent.props as Record<string, unknown>, propName, value);
      updateComponentProps(selectedComponent.id, newProps);
    } else {
      updateComponentProps(selectedComponent.id, { [propName]: value });
    }
  };

  const handleSxChange = (value: string) => {
    setSxValue(value);
    try {
      const parsed = JSON.parse(value);
      updateComponentProps(selectedComponent.id, { sx: parsed });
    } catch {
      // Invalid JSON, don't update
    }
  };

  const renderPropEditor = (prop: PropDefinition) => {
    const currentValue = getNestedValue(selectedComponent.props as Record<string, unknown>, prop.name);

    switch (prop.type) {
      case 'string':
        return (
          <TextField
            key={prop.name}
            fullWidth
            size="small"
            label={prop.label}
            value={(currentValue as string) ?? ''}
            onChange={(e) => handlePropChange(prop.name, e.target.value)}
            sx={{ mb: 2 }}
          />
        );

      case 'number':
        return (
          <TextField
            key={prop.name}
            fullWidth
            size="small"
            type="number"
            label={prop.label}
            value={(currentValue as number) ?? ''}
            onChange={(e) => handlePropChange(prop.name, Number(e.target.value))}
            inputProps={{ min: prop.min, max: prop.max, step: prop.step }}
            sx={{ mb: 2 }}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={prop.name}
            control={
              <Switch
                checked={Boolean(currentValue)}
                onChange={(e) => handlePropChange(prop.name, e.target.checked)}
              />
            }
            label={prop.label}
            sx={{ mb: 1, display: 'flex' }}
          />
        );

      case 'select':
        return (
          <FormControl key={prop.name} fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{prop.label}</InputLabel>
            <Select
              value={(currentValue as string) ?? ''}
              label={prop.label}
              onChange={(e) => handlePropChange(prop.name, e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {prop.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'slider':
        return (
          <Box key={prop.name} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {prop.label}: {String(currentValue ?? prop.min ?? 0)}
            </Typography>
            <Slider
              value={(currentValue as number) ?? prop.min ?? 0}
              min={prop.min ?? 0}
              max={prop.max ?? 100}
              step={prop.step ?? 1}
              onChange={(_, value) => handlePropChange(prop.name, value)}
              valueLabelDisplay="auto"
            />
          </Box>
        );

      case 'color':
      case 'backgroundColor':
        return (
          <ColorPickerField
            key={prop.name}
            value={(currentValue as string) ?? ''}
            onChange={(color) => handlePropChange(prop.name, color)}
            label={prop.label}
          />
        );

      case 'dimension':
      case 'spacing':
        return (
          <DimensionInput
            key={prop.name}
            value={currentValue as string | number}
            onChange={(value) => handlePropChange(prop.name, value)}
            label={prop.label}
          />
        );

      case 'options':
        return (
          <OptionsEditor
            key={prop.name}
            value={(currentValue as string[]) ?? []}
            onChange={(options) => handlePropChange(prop.name, options)}
            label={prop.label}
          />
        );

      case 'sx':
        return (
          <TextField
            key={prop.name}
            fullWidth
            size="small"
            multiline
            rows={8}
            label={prop.label}
            value={sxValue}
            onChange={(e) => handleSxChange(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Enter valid JSON for sx prop"
          />
        );

      case 'icon':
        return (
          <FormControl key={prop.name} fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>{prop.label}</InputLabel>
            <Select
              value={(currentValue as string) ?? ''}
              label={prop.label}
              onChange={(e) => handlePropChange(prop.name, e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Home">Home</MenuItem>
              <MenuItem value="Menu">Menu</MenuItem>
              <MenuItem value="Search">Search</MenuItem>
              <MenuItem value="Settings">Settings</MenuItem>
              <MenuItem value="Add">Add</MenuItem>
              <MenuItem value="Delete">Delete</MenuItem>
              <MenuItem value="Edit">Edit</MenuItem>
              <MenuItem value="Close">Close</MenuItem>
              <MenuItem value="Check">Check</MenuItem>
              <MenuItem value="ArrowBack">Arrow Back</MenuItem>
              <MenuItem value="ArrowForward">Arrow Forward</MenuItem>
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

  // Group props by their group
  const groupedProps: Record<string, PropDefinition[]> = {
    basic: [],
    style: [],
    layout: [],
    advanced: [],
  };

  definition.availableProps.forEach((prop) => {
    const group = prop.group || 'basic';
    if (!groupedProps[group]) {
      groupedProps[group] = [];
    }
    groupedProps[group].push(prop);
  });

  const groupLabels: Record<string, string> = {
    basic: 'Basic Properties',
    style: 'Style & Appearance',
    layout: 'Layout & Spacing',
    advanced: 'Advanced',
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Properties</Typography>
        <Chip
          label={selectedComponent.type}
          size="small"
          color="primary"
          sx={{ mt: 0.5 }}
        />
        {selectedComponent.customName && (
          <Typography variant="caption" display="block" color="text.secondary">
            {selectedComponent.customName}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(groupedProps).map(([group, props]) => {
          if (props.length === 0) return null;

          return (
            <Accordion
              key={group}
              expanded={expandedSections.includes(group)}
              onChange={() => handleSectionToggle(group)}
              disableGutters
              sx={{ '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">{groupLabels[group] || group}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {props.map((prop) => renderPropEditor(prop))}
              </AccordionDetails>
            </Accordion>
          );
        })}

        <Accordion
          expanded={expandedSections.includes('info')}
          onChange={() => handleSectionToggle('info')}
          disableGutters
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Component Info</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>ID:</strong> {selectedComponent.id}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Type:</strong> {selectedComponent.type}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Library:</strong> {selectedComponent.library}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Can have children:</strong> {definition.canHaveChildren ? 'Yes' : 'No'}
              </Typography>
              {definition.acceptsChildren && (
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>Accepts:</strong> {definition.acceptsChildren.join(', ')}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Children count:</strong> {selectedComponent.children.length}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
