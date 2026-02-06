import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Login as AuthIcon,
  Description as FormIcon,
  ViewQuilt as LayoutIcon,
  Navigation as NavIcon,
  CreditCard as CardIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../store/useBuilderStore';
import { templates, templateCategories, getTemplatesByCategory } from '../utils/templates';
import type { Template } from '../types';

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  auth: <AuthIcon />,
  forms: <FormIcon />,
  layouts: <LayoutIcon />,
  navigation: <NavIcon />,
  cards: <CardIcon />,
  dashboards: <DashboardIcon />,
};

export function TemplateLibrary({ open, onClose }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { addComponentFromTemplate } = useBuilderStore();

  const filteredTemplates = (() => {
    let result = selectedCategory === 'all'
      ? templates
      : getTemplatesByCategory(selectedCategory as Template['category']);

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(lowerSearch) ||
        t.description.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  })();

  const handleUseTemplate = (template: Template) => {
    addComponentFromTemplate(template);
    onClose();
  };

  const countByCategory = (category: string) => {
    if (category === 'all') return templates.length;
    return getTemplatesByCategory(category as Template['category']).length;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6">Template Library</Typography>
          <Typography variant="body2" color="text.secondary">
            Pre-built layouts and components to speed up your work
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                All
                <Chip label={countByCategory('all')} size="small" />
              </Box>
            }
            value="all"
          />
          {templateCategories.map((cat) => (
            <Tab
              key={cat.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {categoryIcons[cat.id]}
                  {cat.label}
                  <Chip label={countByCategory(cat.id)} size="small" />
                </Box>
              }
              value={cat.id}
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent>
        {filteredTemplates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              No templates found {search ? `for "${search}"` : ''}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredTemplates.map((template) => (
              <Grid key={template.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2,
                    },
                  }}
                >
                  {/* Preview area */}
                  <Box
                    sx={{
                      height: 140,
                      backgroundColor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ opacity: 0.5 }}>
                      {categoryIcons[template.category]}
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {template.components.length} component{template.components.length !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
}
