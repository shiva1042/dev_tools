import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Divider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ec4899' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

type UnitSystem = 'metric' | 'imperial';

interface BMICategory {
  name: string;
  min: number;
  max: number;
  color: string;
}

const bmiCategories: BMICategory[] = [
  { name: 'Underweight', min: 0, max: 18.5, color: '#3b82f6' },
  { name: 'Normal', min: 18.5, max: 25, color: '#22c55e' },
  { name: 'Overweight', min: 25, max: 30, color: '#f59e0b' },
  { name: 'Obese', min: 30, max: 100, color: '#ef4444' },
];

export default function App() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(7);
  const [pounds, setPounds] = useState(154);

  const bmi = useMemo(() => {
    if (unitSystem === 'metric') {
      const heightM = height / 100;
      return weight / (heightM * heightM);
    } else {
      const totalInches = feet * 12 + inches;
      return (pounds / (totalInches * totalInches)) * 703;
    }
  }, [unitSystem, weight, height, feet, inches, pounds]);

  const category = bmiCategories.find((c) => bmi >= c.min && bmi < c.max) || bmiCategories[3];

  const idealWeight = useMemo(() => {
    if (unitSystem === 'metric') {
      const heightM = height / 100;
      const minWeight = 18.5 * heightM * heightM;
      const maxWeight = 25 * heightM * heightM;
      return { min: minWeight.toFixed(1), max: maxWeight.toFixed(1), unit: 'kg' };
    } else {
      const totalInches = feet * 12 + inches;
      const minWeight = (18.5 * totalInches * totalInches) / 703;
      const maxWeight = (25 * totalInches * totalInches) / 703;
      return { min: minWeight.toFixed(1), max: maxWeight.toFixed(1), unit: 'lbs' };
    }
  }, [unitSystem, height, feet, inches]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <MonitorWeightIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              BMI Calculator
            </Typography>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ToggleButtonGroup
                value={unitSystem}
                exclusive
                onChange={(_, v) => v && setUnitSystem(v)}
                color="primary"
              >
                <ToggleButton value="metric">Metric</ToggleButton>
                <ToggleButton value="imperial">Imperial</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {unitSystem === 'metric' ? (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Weight: {weight} kg
                  </Typography>
                  <Slider
                    value={weight}
                    onChange={(_, v) => setWeight(v as number)}
                    min={30}
                    max={200}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Height: {height} cm
                  </Typography>
                  <Slider
                    value={height}
                    onChange={(_, v) => setHeight(v as number)}
                    min={100}
                    max={220}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Weight: {pounds} lbs
                  </Typography>
                  <Slider
                    value={pounds}
                    onChange={(_, v) => setPounds(v as number)}
                    min={66}
                    max={440}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Feet"
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(parseInt(e.target.value) || 0)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Inches"
                    type="number"
                    value={inches}
                    onChange={(e) => setInches(parseInt(e.target.value) || 0)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Your BMI
            </Typography>
            <Typography
              variant="h2"
              sx={{ fontWeight: 'bold', color: category.color, mb: 1 }}
            >
              {bmi.toFixed(1)}
            </Typography>
            <Typography variant="h6" sx={{ color: category.color }}>
              {category.name}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              BMI Categories
            </Typography>
            <Box sx={{ mb: 3 }}>
              {bmiCategories.map((cat) => (
                <Box
                  key={cat.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: cat.name === category.name ? `${cat.color}20` : 'transparent',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color }} />
                    <Typography variant="body2">{cat.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {cat.min} - {cat.max === 100 ? '30+' : cat.max}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Ideal Weight Range
              </Typography>
              <Typography variant="h6" color="success.main">
                {idealWeight.min} - {idealWeight.max} {idealWeight.unit}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
