import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import { useMapStore } from '../../store/mapStore';
import type { PopupTemplateConfig, PopupFieldInfo, PopupExpressionInfo } from '../../types';

export default function PopupBuilder() {
  const { popupTemplates, addPopupTemplate, updatePopupTemplate, removePopupTemplate } =
    useMapStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PopupTemplateConfig | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false);

  const [newTemplate, setNewTemplate] = useState<{
    title: string;
    content: string;
    fields: PopupFieldInfo[];
    expressions: PopupExpressionInfo[];
  }>({
    title: '{Name}',
    content: '',
    fields: [],
    expressions: [],
  });

  const [newField, setNewField] = useState<PopupFieldInfo>({
    fieldName: '',
    label: '',
    visible: true,
  });

  const [newExpression, setNewExpression] = useState<PopupExpressionInfo>({
    name: '',
    title: '',
    expression: '',
    returnType: 'string',
  });

  const handleAddTemplate = () => {
    const template: Omit<PopupTemplateConfig, 'id'> = {
      title: newTemplate.title,
      content: newTemplate.content || undefined,
      fieldInfos: newTemplate.fields.length > 0 ? newTemplate.fields : undefined,
      expressionInfos: newTemplate.expressions.length > 0 ? newTemplate.expressions : undefined,
    };

    if (editingTemplate) {
      updatePopupTemplate(editingTemplate.id, template);
    } else {
      addPopupTemplate(template);
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleEditTemplate = (template: PopupTemplateConfig) => {
    setEditingTemplate(template);
    setNewTemplate({
      title: template.title,
      content: template.content || '',
      fields: template.fieldInfos || [],
      expressions: template.expressionInfos || [],
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setNewTemplate({
      title: '{Name}',
      content: '',
      fields: [],
      expressions: [],
    });
    setEditingTemplate(null);
  };

  const addField = () => {
    if (!newField.fieldName) return;
    setNewTemplate({
      ...newTemplate,
      fields: [...newTemplate.fields, { ...newField }],
    });
    setNewField({ fieldName: '', label: '', visible: true });
  };

  const removeField = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      fields: newTemplate.fields.filter((_, i) => i !== index),
    });
  };

  const addExpression = () => {
    if (!newExpression.name || !newExpression.expression) return;
    setNewTemplate({
      ...newTemplate,
      expressions: [...newTemplate.expressions, { ...newExpression }],
    });
    setNewExpression({ name: '', title: '', expression: '', returnType: 'string' });
  };

  const removeExpression = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      expressions: newTemplate.expressions.filter((_, i) => i !== index),
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" color="primary">
            Popup Templates ({popupTemplates.length})
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          variant="outlined"
        >
          Add Popup
        </Button>
      </Box>

      {popupTemplates.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <InfoIcon sx={{ fontSize: 48, opacity: 0.3 }} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            No popup templates yet
          </Typography>
          <Typography variant="caption">
            Click "Add Popup" to create a popup template
          </Typography>
        </Box>
      ) : (
        <List dense disablePadding>
          {popupTemplates.map((template) => (
            <ListItem
              key={template.id}
              sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: 1,
                mb: 0.5,
                cursor: 'pointer',
              }}
              onClick={() => handleEditTemplate(template)}
              secondaryAction={
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePopupTemplate(template.id);
                  }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <InfoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2">{template.title}</Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    {template.fieldInfos && (
                      <Chip
                        label={`${template.fieldInfos.length} fields`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10 }}
                      />
                    )}
                    {template.expressionInfos && (
                      <Chip
                        label={`${template.expressionInfos.length} expressions`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10 }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Current Template JSON Preview */}
      {popupTemplates.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Template Configuration:
          </Typography>
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              bgcolor: 'rgba(0,0,0,0.3)',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: 11,
              maxHeight: 150,
              overflow: 'auto',
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(popupTemplates, null, 2)}
            </pre>
          </Box>
        </Box>
      )}

      {/* Add/Edit Popup Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          resetForm();
          setDialogOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? 'Edit Popup Template' : 'Add Popup Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Popup Title"
              size="small"
              fullWidth
              value={newTemplate.title}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, title: e.target.value })
              }
              placeholder="{Name}"
              helperText="Use {fieldName} for dynamic values"
            />

            <TextField
              label="Custom Content (HTML)"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={newTemplate.content}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, content: e.target.value })
              }
              placeholder="<div><b>{Name}</b><br/>{Description}</div>"
              helperText="Optional custom HTML content"
            />

            <Divider />

            {/* Field Infos */}
            <Accordion
              expanded={expanded === 'fields'}
              onChange={(_, isExpanded) =>
                setExpanded(isExpanded ? 'fields' : false)
              }
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableChartIcon fontSize="small" />
                  <Typography variant="body2">
                    Field Configuration ({newTemplate.fields.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Field Name"
                    size="small"
                    value={newField.fieldName}
                    onChange={(e) =>
                      setNewField({ ...newField, fieldName: e.target.value })
                    }
                    placeholder="ObjectID"
                  />
                  <TextField
                    label="Label"
                    size="small"
                    value={newField.label}
                    onChange={(e) =>
                      setNewField({ ...newField, label: e.target.value })
                    }
                    placeholder="ID"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newField.visible}
                        onChange={(e) =>
                          setNewField({ ...newField, visible: e.target.checked })
                        }
                        size="small"
                      />
                    }
                    label="Visible"
                  />
                  <Button size="small" onClick={addField} disabled={!newField.fieldName}>
                    Add
                  </Button>
                </Box>
                {newTemplate.fields.length > 0 && (
                  <List dense>
                    {newTemplate.fields.map((field, index) => (
                      <ListItem key={index} dense>
                        <ListItemText
                          primary={field.fieldName}
                          secondary={field.label || 'No label'}
                        />
                        <IconButton size="small" onClick={() => removeField(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Expression Infos */}
            <Accordion
              expanded={expanded === 'expressions'}
              onChange={(_, isExpanded) =>
                setExpanded(isExpanded ? 'expressions' : false)
              }
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeIcon fontSize="small" />
                  <Typography variant="body2">
                    Arcade Expressions ({newTemplate.expressions.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Name"
                      size="small"
                      value={newExpression.name}
                      onChange={(e) =>
                        setNewExpression({ ...newExpression, name: e.target.value })
                      }
                      placeholder="customExpr"
                    />
                    <TextField
                      label="Title"
                      size="small"
                      value={newExpression.title}
                      onChange={(e) =>
                        setNewExpression({ ...newExpression, title: e.target.value })
                      }
                      placeholder="Custom Value"
                    />
                  </Box>
                  <TextField
                    label="Arcade Expression"
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    value={newExpression.expression}
                    onChange={(e) =>
                      setNewExpression({ ...newExpression, expression: e.target.value })
                    }
                    placeholder="$feature.value * 2"
                  />
                  <Button
                    size="small"
                    onClick={addExpression}
                    disabled={!newExpression.name || !newExpression.expression}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Add Expression
                  </Button>
                </Box>
                {newTemplate.expressions.length > 0 && (
                  <List dense>
                    {newTemplate.expressions.map((expr, index) => (
                      <ListItem key={index} dense>
                        <ListItemText
                          primary={expr.name}
                          secondary={expr.expression}
                        />
                        <IconButton size="small" onClick={() => removeExpression(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddTemplate}
            variant="contained"
            disabled={!newTemplate.title}
          >
            {editingTemplate ? 'Update' : 'Add'} Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
