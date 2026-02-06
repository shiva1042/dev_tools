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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadIcon from '@mui/icons-material/Download';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#22c55e' },
    secondary: { main: '#ef4444' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
}

const categories = [
  { id: 'food', label: 'Food & Dining', color: '#f97316' },
  { id: 'transport', label: 'Transportation', color: '#3b82f6' },
  { id: 'utilities', label: 'Utilities', color: '#8b5cf6' },
  { id: 'entertainment', label: 'Entertainment', color: '#ec4899' },
  { id: 'shopping', label: 'Shopping', color: '#14b8a6' },
  { id: 'health', label: 'Health', color: '#ef4444' },
  { id: 'education', label: 'Education', color: '#6366f1' },
  { id: 'salary', label: 'Salary', color: '#22c55e' },
  { id: 'freelance', label: 'Freelance', color: '#10b981' },
  { id: 'investment', label: 'Investment', color: '#eab308' },
  { id: 'other', label: 'Other', color: '#64748b' },
];

const getCategoryColor = (categoryId: string): string => {
  return categories.find((c) => c.id === categoryId)?.color || '#64748b';
};

const getCategoryLabel = (categoryId: string): string => {
  return categories.find((c) => c.id === categoryId)?.label || categoryId;
};

const sampleExpenses: Expense[] = [
  { id: '1', date: '2024-01-15', description: 'Grocery shopping', amount: 85.50, category: 'food', type: 'expense' },
  { id: '2', date: '2024-01-14', description: 'Monthly salary', amount: 5000, category: 'salary', type: 'income' },
  { id: '3', date: '2024-01-13', description: 'Uber ride', amount: 25.00, category: 'transport', type: 'expense' },
  { id: '4', date: '2024-01-12', description: 'Netflix subscription', amount: 15.99, category: 'entertainment', type: 'expense' },
  { id: '5', date: '2024-01-10', description: 'Freelance project', amount: 800, category: 'freelance', type: 'income' },
];

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [tab, setTab] = useState(0);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'other',
    type: 'expense',
  });

  const stats = useMemo(() => {
    const totalIncome = expenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = expenses
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const byCategory = expenses
      .filter((e) => e.type === 'expense')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

    return { totalIncome, totalExpenses, balance, byCategory };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      if (filterType !== 'all' && e.type !== filterType) return false;
      return true;
    });
  }, [expenses, filterCategory, filterType]);

  const handleSave = () => {
    if (!newExpense.description || !newExpense.amount) return;

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id ? { ...e, ...newExpense } as Expense : e
        )
      );
    } else {
      setExpenses((prev) => [
        { ...newExpense, id: Date.now().toString() } as Expense,
        ...prev,
      ]);
    }

    setDialogOpen(false);
    setEditingExpense(null);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      category: 'other',
      type: 'expense',
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];
    const rows = expenses.map((e) => [
      e.date,
      e.description,
      e.amount.toFixed(2),
      getCategoryLabel(e.category),
      e.type,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expenses.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <AccountBalanceWalletIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Expense Tracker
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => {
                setEditingExpense(null);
                setNewExpense({
                  date: new Date().toISOString().split('T')[0],
                  description: '',
                  amount: 0,
                  category: 'other',
                  type: 'expense',
                });
                setDialogOpen(true);
              }}
            >
              Add Entry
            </Button>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography color="text.secondary">Total Income</Typography>
                </Box>
                <Typography variant="h4" color="primary.main" sx={{ mt: 1 }}>
                  ${stats.totalIncome.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDownIcon color="secondary" />
                  <Typography color="text.secondary">Total Expenses</Typography>
                </Box>
                <Typography variant="h4" color="secondary.main" sx={{ mt: 1 }}>
                  ${stats.totalExpenses.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon sx={{ color: stats.balance >= 0 ? '#22c55e' : '#ef4444' }} />
                  <Typography color="text.secondary">Balance</Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{ mt: 1, color: stats.balance >= 0 ? '#22c55e' : '#ef4444' }}
                >
                  ${stats.balance.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Transactions */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6">Transactions</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={filterType}
                      label="Type"
                      onChange={(e) => setFilterType(e.target.value as any)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expense">Expense</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      label="Category"
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={getCategoryLabel(expense.category)}
                              size="small"
                              sx={{
                                bgcolor: getCategoryColor(expense.category) + '20',
                                color: getCategoryColor(expense.category),
                                borderColor: getCategoryColor(expense.category),
                              }}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: expense.type === 'income' ? '#22c55e' : '#ef4444',
                              fontWeight: 600,
                            }}
                          >
                            {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => handleEdit(expense)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(expense.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* By Category */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Expenses by Category
                </Typography>
                {Object.entries(stats.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const percentage = (amount / stats.totalExpenses) * 100;
                    return (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{getCategoryLabel(category)}</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            ${amount.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 8,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percentage}%`,
                              height: '100%',
                              bgcolor: getCategoryColor(category),
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingExpense ? 'Edit Entry' : 'Add Entry'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Tabs
              value={newExpense.type}
              onChange={(_, v) => setNewExpense({ ...newExpense, type: v })}
              sx={{ mb: 1 }}
            >
              <Tab value="expense" label="Expense" />
              <Tab value="income" label="Income" />
            </Tabs>
            <TextField
              type="date"
              label="Date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newExpense.category}
                label="Category"
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
