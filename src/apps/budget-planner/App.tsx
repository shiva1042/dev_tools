import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import CalculateIcon from '@mui/icons-material/Calculate';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#10b981' },
    secondary: { main: '#ef4444' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface BudgetItem {
  id: string;
  category: string;
  planned: number;
  actual: number;
}

const defaultCategories = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Savings',
  'Other',
];

const sampleBudget: BudgetItem[] = [
  { id: '1', category: 'Housing', planned: 1500, actual: 1500 },
  { id: '2', category: 'Transportation', planned: 400, actual: 380 },
  { id: '3', category: 'Food', planned: 600, actual: 720 },
  { id: '4', category: 'Utilities', planned: 200, actual: 185 },
  { id: '5', category: 'Entertainment', planned: 200, actual: 250 },
  { id: '6', category: 'Savings', planned: 500, actual: 500 },
];

export default function App() {
  const [income, setIncome] = useState(5000);
  const [items, setItems] = useState<BudgetItem[]>(sampleBudget);
  const [newCategory, setNewCategory] = useState('');
  const [newPlanned, setNewPlanned] = useState(0);

  const stats = useMemo(() => {
    const totalPlanned = items.reduce((sum, item) => sum + item.planned, 0);
    const totalActual = items.reduce((sum, item) => sum + item.actual, 0);
    const remaining = income - totalActual;
    const plannedRemaining = income - totalPlanned;

    return { totalPlanned, totalActual, remaining, plannedRemaining };
  }, [items, income]);

  const addItem = () => {
    if (!newCategory || newPlanned <= 0) return;
    setItems([
      ...items,
      { id: Date.now().toString(), category: newCategory, planned: newPlanned, actual: 0 },
    ]);
    setNewCategory('');
    setNewPlanned(0);
  };

  const updateActual = (id: string, actual: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, actual } : item)));
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const getProgressColor = (planned: number, actual: number): string => {
    const ratio = actual / planned;
    if (ratio <= 0.8) return '#10b981';
    if (ratio <= 1) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <CalculateIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Budget Planner
            </Typography>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography color="text.secondary" variant="body2">
                  Monthly Income
                </Typography>
                <TextField
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                  variant="standard"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    sx: { fontSize: 24, fontWeight: 'bold' },
                  }}
                  fullWidth
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Planned
                </Typography>
                <Typography variant="h4" sx={{ color: stats.plannedRemaining >= 0 ? 'primary.main' : 'error.main' }}>
                  ${stats.totalPlanned.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Spent
                </Typography>
                <Typography variant="h4" sx={{ color: stats.remaining >= 0 ? 'primary.main' : 'error.main' }}>
                  ${stats.totalActual.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography color="text.secondary" variant="body2">
                  Remaining
                </Typography>
                <Typography variant="h4" sx={{ color: stats.remaining >= 0 ? 'success.main' : 'error.main' }}>
                  ${stats.remaining.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Add New Category */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add Budget Category
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newCategory}
                  label="Category"
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {defaultCategories
                    .filter((cat) => !items.find((item) => item.category === cat))
                    .map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                label="Planned Amount"
                type="number"
                value={newPlanned || ''}
                onChange={(e) => setNewPlanned(parseFloat(e.target.value) || 0)}
              />
              <Button variant="contained" startIcon={<AddIcon />} onClick={addItem}>
                Add
              </Button>
            </Box>
          </Paper>

          {/* Budget Table */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Planned</TableCell>
                    <TableCell align="right">Actual</TableCell>
                    <TableCell align="right">Difference</TableCell>
                    <TableCell sx={{ width: 200 }}>Progress</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const diff = item.planned - item.actual;
                    const progress = Math.min((item.actual / item.planned) * 100, 100);
                    const progressColor = getProgressColor(item.planned, item.actual);

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">${item.planned.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={item.actual}
                            onChange={(e) => updateActual(item.id, parseFloat(e.target.value) || 0)}
                            size="small"
                            variant="standard"
                            sx={{ width: 100 }}
                            InputProps={{ startAdornment: '$' }}
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: diff >= 0 ? 'success.main' : 'error.main' }}
                        >
                          {diff >= 0 ? '+' : ''}${diff.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': { bgcolor: progressColor },
                              }}
                            />
                            <Typography variant="caption" sx={{ minWidth: 40 }}>
                              {Math.round((item.actual / item.planned) * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => removeItem(item.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Budget Allocation Chart */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Budget Allocation
              </Typography>
              <Box sx={{ display: 'flex', height: 24, borderRadius: 1, overflow: 'hidden' }}>
                {items.map((item, index) => {
                  const width = (item.planned / stats.totalPlanned) * 100;
                  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        width: `${width}%`,
                        bgcolor: colors[index % colors.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                      }}
                      title={`${item.category}: $${item.planned}`}
                    >
                      {width > 10 && (
                        <Typography variant="caption" sx={{ color: 'white', fontSize: 10 }}>
                          {item.category}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
