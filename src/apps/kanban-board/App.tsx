import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  assignee?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const priorityColors = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
};

const defaultColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#64748b',
    tasks: [
      { id: '1', title: 'Research competitors', description: 'Analyze top 5 competitors', priority: 'medium', tags: ['research'] },
      { id: '2', title: 'Design mockups', description: 'Create UI mockups for dashboard', priority: 'high', tags: ['design', 'ui'] },
    ],
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    color: '#3b82f6',
    tasks: [
      { id: '3', title: 'Implement auth', description: 'Set up authentication system', priority: 'high', tags: ['backend'] },
    ],
  },
  {
    id: 'review',
    title: 'In Review',
    color: '#a855f7',
    tasks: [
      { id: '4', title: 'API documentation', description: 'Document REST endpoints', priority: 'low', tags: ['docs'] },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#22c55e',
    tasks: [
      { id: '5', title: 'Project setup', description: 'Initialize repo and CI/CD', priority: 'medium', tags: ['devops'] },
    ],
  },
];

export default function App() {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');
  const [draggedTask, setDraggedTask] = useState<{ task: Task; columnId: string } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuColumnId, setMenuColumnId] = useState<string>('');

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
  });

  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleAddTask = (columnId: string) => {
    setTargetColumnId(columnId);
    setEditingTask(null);
    setNewTask({ title: '', description: '', priority: 'medium', tags: [] });
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task, columnId: string) => {
    setTargetColumnId(columnId);
    setEditingTask(task);
    setNewTask({ ...task });
    setTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!newTask.title) return;

    setColumns((cols) =>
      cols.map((col) => {
        if (col.id === targetColumnId) {
          if (editingTask) {
            return {
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === editingTask.id ? { ...t, ...newTask } as Task : t
              ),
            };
          } else {
            return {
              ...col,
              tasks: [
                ...col.tasks,
                { ...newTask, id: Date.now().toString() } as Task,
              ],
            };
          }
        }
        return col;
      })
    );

    setTaskDialogOpen(false);
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    setColumns((cols) =>
      cols.map((col) => {
        if (col.id === columnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        }
        return col;
      })
    );
  };

  const handleAddColumn = () => {
    if (!newColumnTitle) return;

    setColumns((cols) => [
      ...cols,
      {
        id: Date.now().toString(),
        title: newColumnTitle,
        color: '#64748b',
        tasks: [],
      },
    ]);

    setNewColumnTitle('');
    setColumnDialogOpen(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns((cols) => cols.filter((c) => c.id !== columnId));
    setMenuAnchor(null);
  };

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask) return;

    if (draggedTask.columnId !== targetColumnId) {
      setColumns((cols) =>
        cols.map((col) => {
          if (col.id === draggedTask.columnId) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== draggedTask.task.id),
            };
          }
          if (col.id === targetColumnId) {
            return { ...col, tasks: [...col.tasks, draggedTask.task] };
          }
          return col;
        })
      );
    }

    setDraggedTask(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            gap: 2,
          }}
        >
          <IconButton component={Link} to="/" size="small">
            <HomeIcon />
          </IconButton>
          <ViewKanbanIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            Kanban Board
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setColumnDialogOpen(true)}
          >
            Add Column
          </Button>
        </Box>

        {/* Board */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            gap: 2,
            p: 2,
            overflowX: 'auto',
          }}
        >
          {columns.map((column) => (
            <Paper
              key={column.id}
              sx={{
                minWidth: 300,
                maxWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                borderTop: 3,
                borderColor: column.color,
              }}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {column.title}
                </Typography>
                <Chip
                  label={column.tasks.length}
                  size="small"
                  sx={{ ml: 1, height: 20, fontSize: 12 }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setMenuAnchor(e.currentTarget);
                    setMenuColumnId(column.id);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Tasks */}
              <Box sx={{ flex: 1, p: 1, overflowY: 'auto' }}>
                {column.tasks.map((task) => (
                  <Paper
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                    sx={{
                      p: 2,
                      mb: 1,
                      cursor: 'grab',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderLeft: 3,
                      borderColor: priorityColors[task.priority],
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                      <DragIndicatorIcon
                        fontSize="small"
                        sx={{ color: 'text.secondary', mt: 0.5 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                          {task.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ height: 18, fontSize: 10 }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditTask(task, column.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Add Task Button */}
              <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => handleAddTask(column.id)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Add Task
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Column Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => handleDeleteColumn(menuColumnId)}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Column
          </MenuItem>
        </Menu>

        {/* Task Dialog */}
        <Dialog
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Title"
                value={newTask.title || ''}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={newTask.description || ''}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
              <Box>
                <Typography variant="body2" gutterBottom>
                  Priority
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      sx={{
                        bgcolor: newTask.priority === p ? priorityColors[p] : 'transparent',
                        border: 1,
                        borderColor: priorityColors[p],
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <TextField
                label="Tags (comma separated)"
                value={newTask.tags?.join(', ') || ''}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                  })
                }
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            {editingTask && (
              <Button
                color="error"
                onClick={() => {
                  handleDeleteTask(editingTask.id, targetColumnId);
                  setTaskDialogOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveTask}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Column Dialog */}
        <Dialog open={columnDialogOpen} onClose={() => setColumnDialogOpen(false)}>
          <DialogTitle>Add Column</DialogTitle>
          <DialogContent>
            <TextField
              label="Column Title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              fullWidth
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setColumnDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddColumn}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
