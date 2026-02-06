import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#22c55e' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

type PayPeriod = 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

const payPeriodMultipliers: Record<PayPeriod, number> = {
  hourly: 2080, // 40 hours * 52 weeks
  daily: 260, // 5 days * 52 weeks
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  yearly: 1,
};

const taxBrackets2024 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const calculateFederalTax = (income: number): number => {
  let tax = 0;
  for (const bracket of taxBrackets2024) {
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income - bracket.min, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
    }
  }
  return tax;
};

export default function App() {
  const [salary, setSalary] = useState(75000);
  const [payPeriod, setPayPeriod] = useState<PayPeriod>('yearly');
  const [stateTaxRate, setStateTaxRate] = useState(5);
  const [retirement401k, setRetirement401k] = useState(6);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const calculations = useMemo(() => {
    // Convert to annual
    const annual = salary * payPeriodMultipliers[payPeriod];

    // Federal tax
    const federalTax = calculateFederalTax(annual);

    // State tax
    const stateTax = annual * (stateTaxRate / 100);

    // FICA (Social Security + Medicare)
    const socialSecurity = Math.min(annual, 168600) * 0.062; // 2024 cap
    const medicare = annual * 0.0145;
    const additionalMedicare = annual > 200000 ? (annual - 200000) * 0.009 : 0;
    const fica = socialSecurity + medicare + additionalMedicare;

    // 401k contribution
    const retirement = annual * (retirement401k / 100);

    // Total deductions
    const totalDeductions = federalTax + stateTax + fica + retirement;

    // Net income
    const netAnnual = annual - totalDeductions;

    // Calculate different periods
    const yearly = annual * payPeriodMultipliers['yearly'] / payPeriodMultipliers[payPeriod];
    const monthly = netAnnual / 12;
    const biweekly = netAnnual / 26;
    const weekly = netAnnual / 52;
    const daily = netAnnual / (daysPerWeek * 52);
    const hourly = netAnnual / (hoursPerWeek * 52);

    const effectiveTaxRate = (totalDeductions / annual) * 100;

    return {
      annual,
      federalTax,
      stateTax,
      fica,
      socialSecurity,
      medicare: medicare + additionalMedicare,
      retirement,
      totalDeductions,
      netAnnual,
      monthly,
      biweekly,
      weekly,
      daily,
      hourly,
      effectiveTaxRate,
    };
  }, [salary, payPeriod, stateTaxRate, retirement401k, hoursPerWeek, daysPerWeek]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <AttachMoneyIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Salary Calculator
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Input Section */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Income Details
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="Salary"
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                    sx={{ flex: 2 }}
                  />
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={payPeriod}
                      label="Period"
                      onChange={(e) => setPayPeriod(e.target.value as PayPeriod)}
                    >
                      <MenuItem value="hourly">Hourly</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="biweekly">Bi-weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" gutterBottom>
                  State Tax Rate: {stateTaxRate}%
                </Typography>
                <Slider
                  value={stateTaxRate}
                  onChange={(_, v) => setStateTaxRate(v as number)}
                  min={0}
                  max={15}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ mb: 3 }}
                />

                <Typography variant="subtitle2" gutterBottom>
                  401(k) Contribution: {retirement401k}%
                </Typography>
                <Slider
                  value={retirement401k}
                  onChange={(_, v) => setRetirement401k(v as number)}
                  min={0}
                  max={23}
                  step={0.5}
                  valueLabelDisplay="auto"
                  sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Hours/Week"
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(parseFloat(e.target.value) || 40)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Days/Week"
                    type="number"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(parseFloat(e.target.value) || 5)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Results Section */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Annual Breakdown
                </Typography>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Gross Income</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(calculations.annual)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'error.main' }}>Federal Tax</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{formatCurrency(calculations.federalTax)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'error.main' }}>State Tax ({stateTaxRate}%)</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{formatCurrency(calculations.stateTax)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'error.main' }}>Social Security</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{formatCurrency(calculations.socialSecurity)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'error.main' }}>Medicare</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{formatCurrency(calculations.medicare)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'warning.main' }}>401(k) Contribution</TableCell>
                      <TableCell align="right" sx={{ color: 'warning.main' }}>
                        -{formatCurrency(calculations.retirement)}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderTop: 2, borderColor: 'divider' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>Net Income</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main', fontSize: 18 }}>
                        {formatCurrency(calculations.netAnnual)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Effective Tax Rate: <strong>{calculations.effectiveTaxRate.toFixed(1)}%</strong>
                  </Typography>
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Take-Home Pay
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Annual', value: calculations.netAnnual },
                    { label: 'Monthly', value: calculations.monthly },
                    { label: 'Bi-weekly', value: calculations.biweekly },
                    { label: 'Weekly', value: calculations.weekly },
                    { label: 'Daily', value: calculations.daily },
                    { label: 'Hourly', value: calculations.hourly },
                  ].map(({ label, value }) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={label}>
                      <Paper sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {formatCurrency(value)}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
