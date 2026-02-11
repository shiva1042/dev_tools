import { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Snackbar, Chip,
} from '@mui/material';
import { ContentCopy, Home, Search, Schedule, Error as ErrorIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };

const FIELD_NAMES_5 = ['Minute (0-59)', 'Hour (0-23)', 'Day of Month (1-31)', 'Month (1-12)', 'Day of Week (0-7)'];
const FIELD_NAMES_6 = ['Second (0-59)', 'Minute (0-59)', 'Hour (0-23)', 'Day of Month (1-31)', 'Month (1-12)', 'Day of Week (0-7)'];
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SPECIALS: Record<string, { cron: string; desc: string }> = {
  '@yearly': { cron: '0 0 1 1 *', desc: 'Once a year at midnight on January 1st' },
  '@annually': { cron: '0 0 1 1 *', desc: 'Once a year at midnight on January 1st' },
  '@monthly': { cron: '0 0 1 * *', desc: 'Once a month at midnight on the 1st' },
  '@weekly': { cron: '0 0 * * 0', desc: 'Once a week at midnight on Sunday' },
  '@daily': { cron: '0 0 * * *', desc: 'Once a day at midnight' },
  '@midnight': { cron: '0 0 * * *', desc: 'Once a day at midnight' },
  '@hourly': { cron: '0 * * * *', desc: 'Once an hour at minute 0' },
  '@reboot': { cron: '@reboot', desc: 'Once at startup' },
};

const COMMON_EXPRESSIONS = [
  { expr: '* * * * *', desc: 'Every minute' },
  { expr: '*/5 * * * *', desc: 'Every 5 minutes' },
  { expr: '*/15 * * * *', desc: 'Every 15 minutes' },
  { expr: '*/30 * * * *', desc: 'Every 30 minutes' },
  { expr: '0 * * * *', desc: 'Every hour' },
  { expr: '0 */2 * * *', desc: 'Every 2 hours' },
  { expr: '0 */6 * * *', desc: 'Every 6 hours' },
  { expr: '0 0 * * *', desc: 'Daily at midnight' },
  { expr: '0 6 * * *', desc: 'Daily at 6:00 AM' },
  { expr: '0 9 * * 1-5', desc: 'Weekdays at 9:00 AM' },
  { expr: '0 17 * * 1-5', desc: 'Weekdays at 5:00 PM' },
  { expr: '0 0 * * 0', desc: 'Weekly on Sunday at midnight' },
  { expr: '0 0 1 * *', desc: 'First day of month at midnight' },
  { expr: '0 0 1 1 *', desc: 'Yearly on January 1st' },
  { expr: '30 3 * * 1-5', desc: 'Weekdays at 3:30 AM' },
  { expr: '0 0 * * 6,0', desc: 'Weekends at midnight' },
  { expr: '0 8-17 * * 1-5', desc: 'Every hour 8AM-5PM weekdays' },
  { expr: '0 0 15 * *', desc: '15th of every month at midnight' },
  { expr: '*/10 * * * 1', desc: 'Every 10 min on Mondays' },
  { expr: '0 0 1 */3 *', desc: 'Quarterly on the 1st at midnight' },
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland',
];

function validateField(value: string, min: number, max: number): string | null {
  if (value === '*') return null;
  const parts = value.split(',');
  for (const part of parts) {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      if (range !== '*' && range !== '') {
        const err = validateField(range, min, max);
        if (err) return err;
      }
      const s = parseInt(step);
      if (isNaN(s) || s < 1) return `Invalid step value: ${step}`;
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (isNaN(start) || isNaN(end)) return `Invalid range: ${part}`;
      if (start < min || start > max || end < min || end > max) return `Range ${part} out of bounds (${min}-${max})`;
      if (start > end) return `Invalid range: ${start} > ${end}`;
    } else {
      const n = parseInt(part);
      if (isNaN(n)) return `Invalid value: ${part}`;
      if (n < min || n > max) return `Value ${n} out of bounds (${min}-${max})`;
    }
  }
  return null;
}

function explainField(value: string, fieldName: string, min: number, max: number): string {
  if (value === '*') return `every ${fieldName}`;
  const parts = value.split(',');
  const explained = parts.map(part => {
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      const rangeStr = range === '*' ? '' : ` from ${range}`;
      return `every ${step} ${fieldName}s${rangeStr}`;
    }
    if (part.includes('-')) {
      const [start, end] = part.split('-');
      if (fieldName === 'day of week') return `${DOW_NAMES[parseInt(start)] || start} through ${DOW_NAMES[parseInt(end)] || end}`;
      if (fieldName === 'month') return `${MONTH_NAMES[parseInt(start)] || start} through ${MONTH_NAMES[parseInt(end)] || end}`;
      return `${start} through ${end}`;
    }
    const n = parseInt(part);
    if (fieldName === 'day of week') return DOW_NAMES[n] || part;
    if (fieldName === 'month') return MONTH_NAMES[n] || part;
    return part;
  });
  return explained.join(', ');
}

function getNextRuns(expression: string, count: number, timezone: string): Date[] {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5) return [];

  const has6 = parts.length === 6;
  const [minStr, hourStr, domStr, monStr, dowStr] = has6 ? parts.slice(1) : parts;

  const expand = (field: string, min: number, max: number): number[] => {
    const result = new Set<number>();
    field.split(',').forEach(part => {
      if (part.includes('/')) {
        const [range, step] = part.split('/');
        const s = parseInt(step);
        let start = min, end = max;
        if (range !== '*' && range.includes('-')) { const [a, b] = range.split('-').map(Number); start = a; end = b; }
        else if (range !== '*') start = parseInt(range);
        for (let i = start; i <= end; i += s) result.add(i);
      } else if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number);
        for (let i = a; i <= b; i++) result.add(i);
      } else if (part === '*') {
        for (let i = min; i <= max; i++) result.add(i);
      } else {
        result.add(parseInt(part));
      }
    });
    return Array.from(result).sort((a, b) => a - b);
  };

  const minutes = expand(minStr, 0, 59);
  const hours = expand(hourStr, 0, 23);
  const doms = domStr === '*' ? null : expand(domStr, 1, 31);
  const months = expand(monStr, 1, 12);
  const dows = dowStr === '*' ? null : expand(dowStr, 0, 7).map(d => d === 7 ? 0 : d);

  const runs: Date[] = [];
  const now = new Date();
  const check = new Date(now.getTime() + 60000);
  check.setSeconds(0, 0);

  for (let i = 0; i < 525960 && runs.length < count; i++) {
    const t = new Date(check.getTime() + i * 60000);
    const m = t.getMinutes(), h = t.getHours(), dom = t.getDate(), mon = t.getMonth() + 1, dow = t.getDay();
    if (!minutes.includes(m)) continue;
    if (!hours.includes(h)) continue;
    if (!months.includes(mon)) continue;
    if (doms !== null && dows !== null) { if (!doms.includes(dom) && !dows.includes(dow)) continue; }
    else if (doms !== null && !doms.includes(dom)) continue;
    else if (dows !== null && !dows.includes(dow)) continue;
    runs.push(t);
  }
  return runs;
}

export default function App() {
  const [expression, setExpression] = useState('0 9 * * 1-5');
  const [timezone, setTimezone] = useState('UTC');
  const [searchLib, setSearchLib] = useState('');
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const resolvedExpr = useMemo(() => {
    const trimmed = expression.trim();
    if (SPECIALS[trimmed]) return SPECIALS[trimmed].cron;
    return trimmed;
  }, [expression]);

  const parts = useMemo(() => resolvedExpr.split(/\s+/), [resolvedExpr]);
  const is6Field = parts.length === 6;
  const isSpecial = expression.trim().startsWith('@');
  const fieldNames = is6Field ? FIELD_NAMES_6 : FIELD_NAMES_5;

  const validation = useMemo(() => {
    if (isSpecial) {
      if (SPECIALS[expression.trim()]) return { valid: true, errors: [] as string[] };
      return { valid: false, errors: [`Unknown special string: ${expression.trim()}`] };
    }
    if (parts.length < 5 || parts.length > 6) return { valid: false, errors: [`Expected 5 or 6 fields, got ${parts.length}`] };
    const errors: string[] = [];
    const bounds = is6Field ? [[0, 59], [0, 59], [0, 23], [1, 31], [1, 12], [0, 7]] : [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
    parts.forEach((p, i) => { const err = validateField(p, bounds[i][0], bounds[i][1]); if (err) errors.push(`${fieldNames[i]}: ${err}`); });
    return { valid: errors.length === 0, errors };
  }, [parts, is6Field, isSpecial, expression, fieldNames]);

  const explanation = useMemo(() => {
    if (isSpecial && SPECIALS[expression.trim()]) return SPECIALS[expression.trim()].desc;
    if (!validation.valid) return '';
    const names = is6Field ? ['second', 'minute', 'hour', 'day of month', 'month', 'day of week'] : ['minute', 'hour', 'day of month', 'month', 'day of week'];
    const bounds = is6Field ? [[0, 59], [0, 59], [0, 23], [1, 31], [1, 12], [0, 7]] : [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];
    const explained = parts.map((p, i) => explainField(p, names[i], bounds[i][0], bounds[i][1]));

    const timeFields = is6Field ? explained.slice(0, 3) : explained.slice(0, 2);
    const dateFields = is6Field ? explained.slice(3) : explained.slice(2);

    let desc = 'At ';
    if (is6Field) {
      desc += parts[0] === '*' ? 'every second' : `second ${timeFields[0]}`;
      desc += parts[1] === '*' ? '' : `, minute ${timeFields[1]}`;
      desc += parts[2] === '*' ? ', every hour' : `, at ${timeFields[2]} hour(s)`;
    } else {
      desc += parts[0] === '*' ? 'every minute' : `minute ${timeFields[0]}`;
      desc += parts[1] === '*' ? ', every hour' : ` past hour ${timeFields[1]}`;
    }

    const domField = is6Field ? parts[3] : parts[2];
    const monField = is6Field ? parts[4] : parts[3];
    const dowField = is6Field ? parts[5] : parts[4];

    if (domField !== '*') desc += `, on day ${dateFields[0]} of the month`;
    if (monField !== '*') desc += `, in ${dateFields[is6Field ? 1 : 1]}`;
    if (dowField !== '*') desc += `, on ${dateFields[is6Field ? 2 : 2]}`;

    return desc;
  }, [parts, is6Field, validation.valid, isSpecial, expression]);

  const nextRuns = useMemo(() => {
    if (!validation.valid || resolvedExpr === '@reboot') return [];
    return getNextRuns(resolvedExpr, 10, timezone);
  }, [resolvedExpr, validation.valid, timezone]);

  const filteredLib = useMemo(() => {
    if (!searchLib) return COMMON_EXPRESSIONS;
    const q = searchLib.toLowerCase();
    return COMMON_EXPRESSIONS.filter(e => e.desc.toLowerCase().includes(q) || e.expr.includes(q));
  }, [searchLib]);

  // Weekly view: which days have runs in next 7 days
  const weekView = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
      return { date: d, runs: 0 };
    });
    nextRuns.forEach(r => {
      const dayStart = new Date(r); dayStart.setHours(0, 0, 0, 0);
      const idx = days.findIndex(d => d.date.getTime() === dayStart.getTime());
      if (idx >= 0) days[idx].runs++;
    });
    return days;
  }, [nextRuns]);

  // 24-hour view: show hour buckets for next runs
  const hourView = useMemo(() => {
    const hours = Array(24).fill(0);
    nextRuns.forEach(r => hours[r.getHours()]++);
    return hours;
  }, [nextRuns]);

  const maxHourRuns = Math.max(1, ...hourView);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Crontab Validator & Explainer</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Cron Expression</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <TextField fullWidth size="small" value={expression} onChange={e => setExpression(e.target.value)}
              placeholder="* * * * *" sx={{ flex: 1, minWidth: 200, ...sxField, '& .MuiInputBase-input': { color: 'grey.300', fontFamily: 'monospace', fontSize: 18, fontWeight: 700 } }} />
            <FormControl size="small" sx={{ width: 200, ...sxField }}>
              <InputLabel sx={{ color: 'grey.500' }}>Timezone</InputLabel>
              <Select value={timezone} onChange={e => setTimezone(e.target.value)} label="Timezone" sx={{ color: 'grey.300' }}>
                {TIMEZONES.map(tz => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
              </Select>
            </FormControl>
            <Tooltip title="Copy expression"><IconButton onClick={() => copy(expression)} sx={{ color: 'grey.400' }}><ContentCopy /></IconButton></Tooltip>
          </Box>

          {!isSpecial && validation.valid && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {parts.map((p, i) => (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#90caf9' }}>{p}</Typography>
                  <Typography variant="caption" sx={{ color: 'grey.500', fontSize: 10 }}>{fieldNames[i]}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {!validation.valid && (
            <Box sx={{ p: 1.5, bgcolor: '#f4433611', border: '1px solid #f4433644', borderRadius: 1, mb: 2 }}>
              {validation.errors.map((err, i) => (
                <Typography key={i} variant="body2" sx={{ color: '#f44336', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 13 }}>
                  <ErrorIcon sx={{ fontSize: 14 }} /> {err}
                </Typography>
              ))}
            </Box>
          )}

          {explanation && (
            <Box sx={{ p: 1.5, bgcolor: '#1a2332', borderRadius: 1, borderLeft: '3px solid #2196f3', mb: 2 }}>
              <Typography sx={{ color: '#90caf9', fontSize: 14 }}>{explanation}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'grey.500', width: '100%' }}>Special strings:</Typography>
            {Object.entries(SPECIALS).map(([key, val]) => (
              <Tooltip key={key} title={val.desc}>
                <Chip label={key} size="small" onClick={() => setExpression(key)}
                  sx={{ bgcolor: '#222', color: 'grey.400', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', '&:hover': { bgcolor: '#333' } }} />
              </Tooltip>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Box sx={{ flex: 2, minWidth: 350 }}>
            {nextRuns.length > 0 && (
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Schedule sx={{ fontSize: 16 }} /> Next 10 Executions
                </Typography>
                {nextRuns.map((r, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: '1px solid #1a1a1a' }}>
                    <Typography sx={{ fontSize: 11, color: 'grey.500', width: 24 }}>#{i + 1}</Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#81c784', flex: 1 }}>
                      {r.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} {r.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                      {(() => { const diff = r.getTime() - Date.now(); const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); return h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : h > 0 ? `${h}h ${m}m` : `${m}m`; })()}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {nextRuns.length > 0 && (
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>24-Hour Timeline</Typography>
                <Box sx={{ display: 'flex', gap: '2px', height: 60, alignItems: 'flex-end' }}>
                  {hourView.map((count, h) => (
                    <Tooltip key={h} title={`${h.toString().padStart(2, '0')}:00 - ${count} run(s)`}>
                      <Box sx={{ flex: 1, height: count > 0 ? `${(count / maxHourRuns) * 100}%` : 2, bgcolor: count > 0 ? '#4caf50' : '#222', borderRadius: '2px 2px 0 0', minHeight: 2, transition: 'height 0.3s', cursor: 'pointer' }} />
                    </Tooltip>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  {[0, 6, 12, 18, 23].map(h => <Typography key={h} variant="caption" sx={{ color: 'grey.600', fontSize: 9 }}>{h}:00</Typography>)}
                </Box>
              </Paper>
            )}

            {weekView.some(d => d.runs > 0) && (
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Weekly View (next 7 days)</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {weekView.map((d, i) => (
                    <Box key={i} sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'grey.500', fontSize: 10, display: 'block' }}>
                        {d.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'grey.600', fontSize: 9, display: 'block' }}>
                        {d.date.getDate()}
                      </Typography>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', mx: 'auto', mt: 0.5, bgcolor: d.runs > 0 ? '#4caf50' + Math.min(99, d.runs * 25).toString() : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: 11, color: d.runs > 0 ? '#fff' : 'grey.600', fontWeight: 600 }}>{d.runs}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, minWidth: 260, maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Common Expressions</Typography>
            <TextField size="small" fullWidth placeholder="Search..." value={searchLib} onChange={e => setSearchLib(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ color: 'grey.500', mr: 0.5, fontSize: 16 }} /> }}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' } }, '& .MuiInputBase-input': { color: 'grey.300', fontSize: 12 } }} />
            {filteredLib.map((e, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', py: 0.5, px: 0.5, borderBottom: '1px solid #1a1a1a', '&:hover': { bgcolor: '#1a1a1a' }, cursor: 'pointer' }}
                onClick={() => setExpression(e.expr)}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#90caf9' }}>{e.expr}</Typography>
                  <Typography variant="caption" sx={{ color: 'grey.500', fontSize: 10 }}>{e.desc}</Typography>
                </Box>
                <IconButton size="small" onClick={ev => { ev.stopPropagation(); copy(e.expr); }} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 12 }} /></IconButton>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={1500} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
