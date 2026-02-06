import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Divider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import StraightenIcon from '@mui/icons-material/Straighten';
import ScaleIcon from '@mui/icons-material/Scale';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import SpeedIcon from '@mui/icons-material/Speed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f59e0b' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

type Category = 'length' | 'weight' | 'temperature' | 'speed' | 'area' | 'data' | 'time';

interface Unit {
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const units: Record<Category, Unit[]> = {
  length: [
    { name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
    { name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  ],
  weight: [
    { name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
    { name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
    { name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { name: 'Tonnes', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  ],
  temperature: [
    { name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
    { name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    { name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  speed: [
    { name: 'Meters/second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
    { name: 'Kilometers/hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    { name: 'Miles/hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    { name: 'Knots', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    { name: 'Feet/second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  ],
  area: [
    { name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
    { name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    { name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
    { name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    { name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
    { name: 'Square Inches', symbol: 'in²', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
  ],
  data: [
    { name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
    { name: 'Kilobytes', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    { name: 'Megabytes', symbol: 'MB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
    { name: 'Gigabytes', symbol: 'GB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
    { name: 'Terabytes', symbol: 'TB', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    { name: 'Bits', symbol: 'b', toBase: (v) => v / 8, fromBase: (v) => v * 8 },
    { name: 'Kilobits', symbol: 'Kb', toBase: (v) => v * 128, fromBase: (v) => v / 128 },
    { name: 'Megabits', symbol: 'Mb', toBase: (v) => v * 131072, fromBase: (v) => v / 131072 },
  ],
  time: [
    { name: 'Seconds', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
    { name: 'Milliseconds', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: 'Minutes', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
    { name: 'Hours', symbol: 'h', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { name: 'Days', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
    { name: 'Weeks', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    { name: 'Months', symbol: 'mo', toBase: (v) => v * 2628000, fromBase: (v) => v / 2628000 },
    { name: 'Years', symbol: 'yr', toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
  ],
};

const categoryIcons: Record<Category, React.ReactElement> = {
  length: <StraightenIcon />,
  weight: <ScaleIcon />,
  temperature: <ThermostatIcon />,
  speed: <SpeedIcon />,
  area: <SquareFootIcon />,
  data: <StorageIcon />,
  time: <AccessTimeIcon />,
};

export default function App() {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');

  const convert = () => {
    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      setToValue('');
      return;
    }

    const categoryUnits = units[category];
    const baseValue = categoryUnits[fromUnit].toBase(value);
    const result = categoryUnits[toUnit].fromBase(baseValue);

    // Format result
    if (Math.abs(result) < 0.001 || Math.abs(result) >= 1000000) {
      setToValue(result.toExponential(6));
    } else {
      setToValue(result.toFixed(6).replace(/\.?0+$/, ''));
    }
  };

  useEffect(() => {
    convert();
  }, [fromValue, fromUnit, toUnit, category]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
  };

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setFromUnit(0);
    setToUnit(1);
    setFromValue('1');
  };

  const currentUnits = units[category];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <SwapHorizIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Unit Converter
            </Typography>
          </Box>

          {/* Category Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={category}
              onChange={(_, v) => handleCategoryChange(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {(Object.keys(units) as Category[]).map((cat) => (
                <Tab
                  key={cat}
                  value={cat}
                  label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                  icon={categoryIcons[cat]}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Paper>

          {/* Converter */}
          <Paper sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              {/* From */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  From
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  sx={{ mb: 2 }}
                  inputProps={{ style: { fontSize: 24 } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={fromUnit}
                    label="Unit"
                    onChange={(e) => setFromUnit(e.target.value as number)}
                  >
                    {currentUnits.map((unit, index) => (
                      <MenuItem key={unit.name} value={index}>
                        {unit.name} ({unit.symbol})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Swap Button */}
              <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'center' }}>
                <IconButton
                  onClick={handleSwap}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <SwapHorizIcon />
                </IconButton>
              </Grid>

              {/* To */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  To
                </Typography>
                <TextField
                  fullWidth
                  value={toValue}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                  inputProps={{ style: { fontSize: 24 } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={toUnit}
                    label="Unit"
                    onChange={(e) => setToUnit(e.target.value as number)}
                  >
                    {currentUnits.map((unit, index) => (
                      <MenuItem key={unit.name} value={index}>
                        {unit.name} ({unit.symbol})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Result Summary */}
            {fromValue && toValue && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'action.hover', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h6">
                  {fromValue} {currentUnits[fromUnit].symbol} = {toValue} {currentUnits[toUnit].symbol}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Quick Reference */}
            <Typography variant="subtitle2" gutterBottom>
              Quick Reference
            </Typography>
            <Grid container spacing={1}>
              {currentUnits.slice(0, 6).map((unit, index) => {
                if (index === fromUnit) return null;
                const baseValue = currentUnits[fromUnit].toBase(parseFloat(fromValue) || 1);
                const converted = unit.fromBase(baseValue);
                const formatted = Math.abs(converted) < 0.001 || Math.abs(converted) >= 1000000
                  ? converted.toExponential(4)
                  : converted.toFixed(4).replace(/\.?0+$/, '');

                return (
                  <Grid size={{ xs: 6, sm: 4 }} key={unit.name}>
                    <Paper sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="text.secondary">
                        {unit.name}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatted} {unit.symbol}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
