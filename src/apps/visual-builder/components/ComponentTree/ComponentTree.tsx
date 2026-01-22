import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../../store/useBuilderStore';
import type { BuilderComponent } from '../../types';

interface TreeNodeProps {
  component: BuilderComponent;
  depth: number;
}

function TreeNode({ component, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const {
    selectedComponentId,
    selectComponent,
    removeComponent,
  } = useBuilderStore();

  const isSelected = selectedComponentId === component.id;
  const hasChildren = component.children.length > 0;

  const handleClick = () => {
    selectComponent(component.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(component.id);
  };

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          pl: depth * 2,
        }}
        secondaryAction={
          <Box sx={{ display: 'flex', gap: 0.5, opacity: isSelected ? 1 : 0, transition: 'opacity 0.2s' }}>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={handleDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
        <ListItemButton
          selected={isSelected}
          onClick={handleClick}
          dense
          sx={{
            borderRadius: 1,
            '&:hover .tree-actions': { opacity: 1 },
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            },
          }}
        >
          {hasChildren ? (
            <IconButton size="small" onClick={handleToggle} sx={{ mr: 0.5, p: 0 }}>
              {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          ) : (
            <Box sx={{ width: 24, mr: 0.5 }} />
          )}
          <ListItemIcon sx={{ minWidth: 24 }}>
            <DragIcon fontSize="small" sx={{ color: 'grey.400' }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                  {component.customName || component.type}
                </Typography>
                {component.customName && (
                  <Chip
                    label={component.type}
                    size="small"
                    sx={{ height: 16, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            }
            secondary={hasChildren ? `${component.children.length} children` : null}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </ListItemButton>
      </ListItem>

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {component.children.map((child) => (
              <TreeNode key={child.id} component={child} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export function ComponentTree() {
  const { components } = useBuilderStore();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Structure</Typography>
        <Typography variant="caption" color="text.secondary">
          {components.length} top-level component{components.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {components.length === 0 ? (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No components yet.
              <br />
              Drag components to the canvas.
            </Typography>
          </Box>
        ) : (
          <List dense>
            {components.map((component) => (
              <TreeNode key={component.id} component={component} depth={0} />
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
