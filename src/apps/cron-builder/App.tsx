import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Schedule,
  Check,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

interface CronPreset {
  name: string;
  expression: string;
  description: string;
}

const presets: CronPreset[] = [
  { name: 'Every minute', expression: '* * * * *', description: 'Runs every minute' },
  { name: 'Every 5 minutes', expression: '*/5 * * * *', description: 'Runs every 5 minutes' },
  { name: 'Every 15 minutes', expression: '*/15 * * * *', description: 'Runs every 15 minutes' },
  { name: 'Every 30 minutes', expression: '*/30 * * * *', description: 'Runs every 30 minutes' },
  { name: 'Every hour', expression: '0 * * * *', description: 'Runs at the start of every hour' },
  { name: 'Every 2 hours', expression: '0 */2 * * *', description: 'Runs every 2 hours' },
  { name: 'Every day at midnight', expression: '0 0 * * *', description: 'Runs at 00:00 every day' },
  { name: 'Every day at noon', expression: '0 12 * * *', description: 'Runs at 12:00 every day' },
  { name: 'Every day at 6am', expression: '0 6 * * *', description: 'Runs at 06:00 every day' },
  { name: 'Every Sunday', expression: '0 0 * * 0', description: 'Runs at midnight every Sunday' },
  { name: 'Every Monday', expression: '0 0 * * 1', description: 'Runs at midnight every Monday' },
  { name: 'Weekdays at 9am', expression: '0 9 * * 1-5', description: 'Runs at 09:00 Monday-Friday' },
  { name: 'First of month', expression: '0 0 1 * *', description: 'Runs at midnight on the 1st' },
  { name: 'Every quarter', expression: '0 0 1 */3 *', description: 'Runs quarterly on the 1st' },
  { name: 'Every year', expression: '0 0 1 1 *', description: 'Runs at midnight on January 1st' },
];

const minuteOptions = [
  { value: '*', label: 'Every minute' },
  { value: '*/5', label: 'Every 5 minutes' },
  { value: '*/10', label: 'Every 10 minutes' },
  { value: '*/15', label: 'Every 15 minutes' },
  { value: '*/30', label: 'Every 30 minutes' },
  { value: '0', label: 'At minute 0' },
  { value: '30', label: 'At minute 30' },
];

const hourOptions = [
  { value: '*', label: 'Every hour' },
  { value: '*/2', label: 'Every 2 hours' },
  { value: '*/4', label: 'Every 4 hours' },
  { value: '*/6', label: 'Every 6 hours' },
  { value: '*/12', label: 'Every 12 hours' },
  { value: '0', label: 'At midnight (0)' },
  { value: '6', label: 'At 6 AM' },
  { value: '9', label: 'At 9 AM' },
  { value: '12', label: 'At noon (12)' },
  { value: '18', label: 'At 6 PM' },
  { value: '0-8', label: 'Night hours (0-8)' },
  { value: '9-17', label: 'Work hours (9-17)' },
];

const dayOfMonthOptions = [
  { value: '*', label: 'Every day' },
  { value: '1', label: '1st of month' },
  { value: '15', label: '15th of month' },
  { value: 'L', label: 'Last day of month' },
  { value: '1,15', label: '1st and 15th' },
  { value: '1-7', label: 'First week' },
];

const monthOptions = [
  { value: '*', label: 'Every month' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
  { value: '*/3', label: 'Every quarter' },
  { value: '1,7', label: 'Jan & Jul' },
];

const dayOfWeekOptions = [
  { value: '*', label: 'Every day' },
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '1-5', label: 'Weekdays (Mon-Fri)' },
  { value: '0,6', label: 'Weekends (Sat-Sun)' },
];

const parseCronPart = (part: string, type: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek'): string => {
  const ranges: Record<string, { min: number; max: number; names?: string[] }> = {
    minute: { min: 0, max: 59 },
    hour: { min: 0, max: 23 },
    dayOfMonth: { min: 1, max: 31 },
    month: { min: 1, max: 12, names: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
    dayOfWeek: { min: 0, max: 6, names: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  };

  const { min, max, names } = ranges[type];

  if (part === '*') return `every ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
  if (part.startsWith('*/')) {
    const step = parseInt(part.slice(2));
    return `every ${step} ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}${step > 1 ? 's' : ''}`;
  }
  if (part.includes('-')) {
    const [start, end] = part.split('-').map(Number);
    if (names) {
      return `${names[start]} through ${names[end]}`;
    }
    return `${start} through ${end}`;
  }
  if (part.includes(',')) {
    const values = part.split(',');
    if (names) {
      return values.map(v => names[parseInt(v)]).join(', ');
    }
    return values.join(', ');
  }
  if (part === 'L') return 'last day';

  const num = parseInt(part);
  if (names && !isNaN(num)) {
    return names[num];
  }
  return part;
};

const getNextRuns = (expression: string, count: number = 5): Date[] => {
  const parts = expression.split(' ');
  if (parts.length !== 5) return [];

  const now = new Date();
  const runs: Date[] = [];
  const maxIterations = 10000;
  let iterations = 0;
  let current = new Date(now);
  current.setSeconds(0);
  current.setMilliseconds(0);
  current.setMinutes(current.getMinutes() + 1);

  while (runs.length < count && iterations < maxIterations) {
    iterations++;

    // Simple check - just increment by minute and check if it matches
    const minute = current.getMinutes();
    const hour = current.getHours();
    const dayOfMonth = current.getDate();
    const month = current.getMonth() + 1;
    const dayOfWeek = current.getDay();

    const matchesPart = (part: string, value: number, min: number, max: number): boolean => {
      if (part === '*') return true;
      if (part.startsWith('*/')) {
        const step = parseInt(part.slice(2));
        return value % step === 0;
      }
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        return value >= start && value <= end;
      }
      if (part.includes(',')) {
        return part.split(',').map(Number).includes(value);
      }
      return parseInt(part) === value;
    };

    if (
      matchesPart(parts[0], minute, 0, 59) &&
      matchesPart(parts[1], hour, 0, 23) &&
      matchesPart(parts[2], dayOfMonth, 1, 31) &&
      matchesPart(parts[3], month, 1, 12) &&
      matchesPart(parts[4], dayOfWeek, 0, 6)
    ) {
      runs.push(new Date(current));
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return runs;
};

const validateCron = (expression: string): { valid: boolean; error?: string } => {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { valid: false, error: `Expected 5 parts, got ${parts.length}` };
  }

  const patterns = [
    /^(\*|[0-9]|[1-5][0-9])(\/[0-9]+)?$|^(\*|[0-9]|[1-5][0-9])(,(\*|[0-9]|[1-5][0-9]))*$|^([0-9]|[1-5][0-9])-([0-9]|[1-5][0-9])$/,
    /^(\*|[0-9]|1[0-9]|2[0-3])(\/[0-9]+)?$|^(\*|[0-9]|1[0-9]|2[0-3])(,(\*|[0-9]|1[0-9]|2[0-3]))*$|^([0-9]|1[0-9]|2[0-3])-([0-9]|1[0-9]|2[0-3])$/,
    /^(\*|[1-9]|[12][0-9]|3[01]|L)(\/[0-9]+)?$|^(\*|[1-9]|[12][0-9]|3[01])(,(\*|[1-9]|[12][0-9]|3[01]))*$|^([1-9]|[12][0-9]|3[01])-([1-9]|[12][0-9]|3[01])$/,
    /^(\*|[1-9]|1[0-2])(\/[0-9]+)?$|^(\*|[1-9]|1[0-2])(,(\*|[1-9]|1[0-2]))*$|^([1-9]|1[0-2])-([1-9]|1[0-2])$/,
    /^(\*|[0-6])(\/[0-9]+)?$|^(\*|[0-6])(,(\*|[0-6]))*$|^[0-6]-[0-6]$/,
  ];

  for (let i = 0; i < 5; i++) {
    if (!patterns[i].test(parts[i]) && parts[i] !== '*') {
      const names = ['minute', 'hour', 'day of month', 'month', 'day of week'];
      return { valid: false, error: `Invalid ${names[i]}: ${parts[i]}` };
    }
  }

  return { valid: true };
};

export default function CronBuilder() {
  const [expression, setExpression] = useState<string>('0 9 * * 1-5');
  const [tab, setTab] = useState<'visual' | 'expression'>('visual');
  const [parts, setParts] = useState<CronParts>({
    minute: '0',
    hour: '9',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '1-5',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const validation = useMemo(() => validateCron(expression), [expression]);
  const nextRuns = useMemo(() => validation.valid ? getNextRuns(expression, 10) : [], [expression, validation.valid]);

  const humanReadable = useMemo(() => {
    if (!validation.valid) return '';
    const p = expression.split(' ');
    const minute = parseCronPart(p[0], 'minute');
    const hour = parseCronPart(p[1], 'hour');
    const dayOfMonth = parseCronPart(p[2], 'dayOfMonth');
    const month = parseCronPart(p[3], 'month');
    const dayOfWeek = parseCronPart(p[4], 'dayOfWeek');

    let desc = 'At ';
    if (p[0] === '*') desc += 'every minute';
    else if (p[0].startsWith('*/')) desc += `every ${p[0].slice(2)} minutes`;
    else desc += `minute ${p[0]}`;

    if (p[1] !== '*') {
      if (p[1].startsWith('*/')) desc += ` of every ${p[1].slice(2)} hours`;
      else desc += ` past hour ${p[1]}`;
    }

    if (p[2] !== '*') desc += ` on day ${p[2]} of the month`;
    if (p[3] !== '*') desc += ` in ${month}`;
    if (p[4] !== '*') desc += ` on ${dayOfWeek}`;

    return desc;
  }, [expression, validation.valid]);

  const handlePartChange = (part: keyof CronParts, value: string) => {
    const newParts = { ...parts, [part]: value };
    setParts(newParts);
    setExpression(`${newParts.minute} ${newParts.hour} ${newParts.dayOfMonth} ${newParts.month} ${newParts.dayOfWeek}`);
  };

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    const p = value.split(' ');
    if (p.length === 5) {
      setParts({
        minute: p[0],
        hour: p[1],
        dayOfMonth: p[2],
        month: p[3],
        dayOfWeek: p[4],
      });
    }
  };

  const handlePresetClick = (preset: CronPreset) => {
    setExpression(preset.expression);
    const p = preset.expression.split(' ');
    setParts({
      minute: p[0],
      hour: p[1],
      dayOfMonth: p[2],
      month: p[3],
      dayOfWeek: p[4],
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(expression);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#111',
          borderBottom: '1px solid #222',
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/">
            <IconButton size="small" sx={{ color: 'grey.500' }}>
              <Home />
            </IconButton>
          </Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
            Cron Expression Builder
          </Typography>
          <Chip
            icon={validation.valid ? <Check /> : <ErrorIcon />}
            label={validation.valid ? 'Valid' : 'Invalid'}
            size="small"
            color={validation.valid ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Left Panel - Builder */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Expression Display */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                Cron Expression
              </Typography>
              <Tooltip title="Copy">
                <IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              value={expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              error={!validation.valid}
              helperText={validation.error}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: 24,
                  bgcolor: '#0a0a0a',
                  color: '#61afef',
                  textAlign: 'center',
                },
              }}
            />
            {validation.valid && (
              <Typography sx={{ mt: 2, color: 'grey.400', textAlign: 'center' }}>
                {humanReadable}
              </Typography>
            )}
          </Paper>

          {/* Visual Builder */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ mb: 3, '& .MuiTab-root': { color: 'grey.500' } }}
            >
              <Tab label="Visual Builder" value="visual" />
              <Tab label="Reference" value="expression" />
            </Tabs>

            {tab === 'visual' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'grey.500' }}>Minute</InputLabel>
                    <Select
                      value={parts.minute}
                      label="Minute"
                      onChange={(e) => handlePartChange('minute', e.target.value)}
                      sx={{ color: 'grey.300' }}
                    >
                      {minuteOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'grey.500' }}>Hour</InputLabel>
                    <Select
                      value={parts.hour}
                      label="Hour"
                      onChange={(e) => handlePartChange('hour', e.target.value)}
                      sx={{ color: 'grey.300' }}
                    >
                      {hourOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'grey.500' }}>Day of Month</InputLabel>
                    <Select
                      value={parts.dayOfMonth}
                      label="Day of Month"
                      onChange={(e) => handlePartChange('dayOfMonth', e.target.value)}
                      sx={{ color: 'grey.300' }}
                    >
                      {dayOfMonthOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'grey.500' }}>Month</InputLabel>
                    <Select
                      value={parts.month}
                      label="Month"
                      onChange={(e) => handlePartChange('month', e.target.value)}
                      sx={{ color: 'grey.300' }}
                    >
                      {monthOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'grey.500' }}>Day of Week</InputLabel>
                    <Select
                      value={parts.dayOfWeek}
                      label="Day of Week"
                      onChange={(e) => handlePartChange('dayOfWeek', e.target.value)}
                      sx={{ color: 'grey.300' }}
                    >
                      {dayOfWeekOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Field Labels */}
                <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    {['Minute', 'Hour', 'Day (Month)', 'Month', 'Day (Week)'].map((label, i) => (
                      <Box key={label}>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: 20, color: '#c678dd' }}>
                          {expression.split(' ')[i]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'grey.600' }}>{label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            {tab === 'expression' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1 }}>
                {[
                  ['*', 'Any value'],
                  [',', 'Value list separator'],
                  ['-', 'Range of values'],
                  ['/', 'Step values'],
                  ['0-59', 'Allowed minute values'],
                  ['0-23', 'Allowed hour values'],
                  ['1-31', 'Allowed day of month'],
                  ['1-12', 'Allowed month values'],
                  ['0-6', 'Allowed day of week (0=Sun)'],
                  ['L', 'Last day of month'],
                ].map(([token, desc]) => (
                  <>
                    <Typography key={`t-${token}`} sx={{ fontFamily: 'monospace', color: '#c678dd' }}>{token}</Typography>
                    <Typography key={`d-${token}`} sx={{ color: 'grey.500', fontSize: 14 }}>{desc}</Typography>
                  </>
                ))}
              </Box>
            )}
          </Paper>
        </Box>

        {/* Right Panel - Presets & Next Runs */}
        <Box sx={{ width: 350, borderLeft: '1px solid #222', overflow: 'auto' }}>
          {/* Next Runs */}
          <Paper sx={{ bgcolor: '#0d0d0d', m: 2, border: '1px solid #222' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderBottom: '1px solid #222' }}>
              <Schedule sx={{ fontSize: 18, color: 'grey.500' }} />
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                Next Runs
              </Typography>
            </Box>
            <List dense sx={{ maxHeight: 250, overflow: 'auto' }}>
              {nextRuns.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="Invalid expression"
                    primaryTypographyProps={{ color: 'grey.600' }}
                  />
                </ListItem>
              ) : (
                nextRuns.map((run, i) => (
                  <ListItem key={i} sx={{ borderBottom: '1px solid #222' }}>
                    <ListItemText
                      primary={run.toLocaleString()}
                      secondary={`In ${Math.round((run.getTime() - Date.now()) / 60000)} minutes`}
                      primaryTypographyProps={{ fontSize: 13, color: 'grey.300', fontFamily: 'monospace' }}
                      secondaryTypographyProps={{ fontSize: 11 }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>

          {/* Presets */}
          <Paper sx={{ bgcolor: '#0d0d0d', m: 2, border: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', p: 2, borderBottom: '1px solid #222' }}>
              Common Presets
            </Typography>
            <List dense sx={{ maxHeight: 350, overflow: 'auto' }}>
              {presets.map((preset) => (
                <ListItem key={preset.name} disablePadding>
                  <ListItemButton onClick={() => handlePresetClick(preset)}>
                    <ListItemText
                      primary={preset.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#61afef' }}>
                            {preset.expression}
                          </Typography>
                        </Box>
                      }
                      primaryTypographyProps={{ fontSize: 13 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
