import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Snackbar, Chip,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab,
} from '@mui/material';
import { Home, ContentCopy } from '@mui/icons-material';

type Algorithm = 'token_bucket' | 'sliding_window' | 'fixed_window' | 'leaky_bucket';

const tfSx = {
  '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: 'grey.300', fontFamily: 'monospace', fontSize: 13 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
};

export default function App() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('token_bucket');
  const [rps, setRps] = useState(100);
  const [burst, setBurst] = useState(200);
  const [windowSec, setWindowSec] = useState(60);
  const [incomingRps, setIncomingRps] = useState(150);
  const [configTab, setConfigTab] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);

  const calculations = useMemo(() => {
    const tokensPerSec = rps;
    const bucketCapacity = burst;
    const windowRequests = rps * windowSec;
    const rejectionRate = Math.max(0, ((incomingRps - rps) / incomingRps) * 100);
    const avgLatencyMs = algorithm === 'leaky_bucket' ? (1000 / rps) : 0;
    const burstDurationSec = burst / rps;
    return { tokensPerSec, bucketCapacity, windowRequests, rejectionRate, avgLatencyMs, burstDurationSec };
  }, [rps, burst, windowSec, incomingRps, algorithm]);

  const timeline = useMemo(() => {
    const slots: { second: number; incoming: number; accepted: number; rejected: number }[] = [];
    let tokens = burst;
    for (let s = 0; s < 10; s++) {
      const incoming = incomingRps;
      let accepted = 0;
      if (algorithm === 'token_bucket') {
        tokens = Math.min(burst, tokens + rps);
        accepted = Math.min(incoming, tokens);
        tokens -= accepted;
      } else if (algorithm === 'leaky_bucket') {
        accepted = Math.min(incoming, rps);
      } else if (algorithm === 'fixed_window' || algorithm === 'sliding_window') {
        const maxPerSec = Math.ceil(rps * windowSec / windowSec);
        accepted = Math.min(incoming, maxPerSec);
      }
      slots.push({ second: s + 1, incoming, accepted, rejected: incoming - accepted });
    }
    return slots;
  }, [rps, burst, incomingRps, algorithm, windowSec]);

  const configs = useMemo(() => {
    const nginx = `# Nginx Rate Limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=${rps}r/s;

server {
    location /api/ {
        limit_req zone=api burst=${burst} nodelay;
        limit_req_status 429;
    }
}`;
    const express = `// Express Rate Limiting (express-rate-limit)
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: ${windowSec * 1000}, // ${windowSec} seconds
  max: ${rps * windowSec}, // ${rps * windowSec} requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);`;
    const spring = `// Spring Boot Rate Limiting (Bucket4j)
@Bean
public Bucket createBucket() {
    Bandwidth limit = Bandwidth.classic(
        ${burst}, // capacity
        Refill.greedy(${rps}, Duration.ofSeconds(1)) // ${rps} tokens per second
    );
    return Bucket.builder().addLimit(limit).build();
}

// Usage in filter
if (bucket.tryConsume(1)) {
    filterChain.doFilter(request, response);
} else {
    response.setStatus(429);
}`;
    const redis = `-- Redis Sliding Window (Lua Script)
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = ${windowSec}
local limit = ${rps * windowSec}

redis.call('ZREMRANGEBYSCORE', key, 0, now - window * 1000)
local count = redis.call('ZCARD', key)

if count < limit then
    redis.call('ZADD', key, now, now .. math.random())
    redis.call('EXPIRE', key, window)
    return 1 -- allowed
else
    return 0 -- rejected
end`;
    const kong = `# Kong Rate Limiting Plugin
plugins:
  - name: rate-limiting
    config:
      second: ${rps}
      policy: local
      fault_tolerant: true
      hide_client_headers: false
      redis_timeout: 2000`;
    const envoy = `# Envoy Rate Limiting
rate_limits:
  - actions:
      - remote_address: {}
    stage: 0
    limit:
      requests_per_unit: ${rps}
      unit: SECOND`;
    return [
      { label: 'Nginx', code: nginx },
      { label: 'Express', code: express },
      { label: 'Spring Boot', code: spring },
      { label: 'Redis Lua', code: redis },
      { label: 'Kong', code: kong },
      { label: 'Envoy', code: envoy },
    ];
  }, [rps, burst, windowSec]);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setSnackOpen(true); };

  const maxTimeline = Math.max(...timeline.map(t => t.incoming));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Rate Limit Calculator</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {/* Algorithm Selection */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Algorithm</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {([
                { value: 'token_bucket' as Algorithm, label: 'Token Bucket', desc: 'Allows bursts, steady refill' },
                { value: 'sliding_window' as Algorithm, label: 'Sliding Window', desc: 'Smooth rate across time' },
                { value: 'fixed_window' as Algorithm, label: 'Fixed Window', desc: 'Simple counter per window' },
                { value: 'leaky_bucket' as Algorithm, label: 'Leaky Bucket', desc: 'Constant output rate' },
              ]).map(a => (
                <Chip key={a.value} label={a.label} onClick={() => setAlgorithm(a.value)}
                  variant={algorithm === a.value ? 'filled' : 'outlined'}
                  sx={{ bgcolor: algorithm === a.value ? '#1976d2' : 'transparent', color: algorithm === a.value ? 'white' : 'grey.400', borderColor: '#333' }} />
              ))}
            </Box>
          </Paper>

          {/* Parameters */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Parameters</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField size="small" label="Requests/sec" type="number" value={rps}
                onChange={e => setRps(Math.max(1, Number(e.target.value)))} sx={{ ...tfSx, width: 150 }} />
              {(algorithm === 'token_bucket' || algorithm === 'leaky_bucket') && (
                <TextField size="small" label="Burst / Bucket size" type="number" value={burst}
                  onChange={e => setBurst(Math.max(1, Number(e.target.value)))} sx={{ ...tfSx, width: 170 }} />
              )}
              {(algorithm === 'sliding_window' || algorithm === 'fixed_window') && (
                <TextField size="small" label="Window (sec)" type="number" value={windowSec}
                  onChange={e => setWindowSec(Math.max(1, Number(e.target.value)))} sx={{ ...tfSx, width: 150 }} />
              )}
              <TextField size="small" label="Incoming RPS (test)" type="number" value={incomingRps}
                onChange={e => setIncomingRps(Math.max(1, Number(e.target.value)))} sx={{ ...tfSx, width: 170 }} />
            </Box>
          </Paper>

          {/* Calculations */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Calculated Values</Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography sx={{ color: 'grey.600', fontSize: 11 }}>Steady throughput</Typography>
                <Typography sx={{ color: '#66bb6a', fontFamily: 'monospace', fontWeight: 700, fontSize: 20 }}>{rps}/s</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: 'grey.600', fontSize: 11 }}>Burst capacity</Typography>
                <Typography sx={{ color: '#42a5f5', fontFamily: 'monospace', fontWeight: 700, fontSize: 20 }}>{burst}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: 'grey.600', fontSize: 11 }}>Window total</Typography>
                <Typography sx={{ color: '#ab47bc', fontFamily: 'monospace', fontWeight: 700, fontSize: 20 }}>{calculations.windowRequests}</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: 'grey.600', fontSize: 11 }}>Rejection rate</Typography>
                <Typography sx={{ color: calculations.rejectionRate > 0 ? '#ef5350' : '#66bb6a', fontFamily: 'monospace', fontWeight: 700, fontSize: 20 }}>
                  {calculations.rejectionRate.toFixed(1)}%
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: 'grey.600', fontSize: 11 }}>Burst duration</Typography>
                <Typography sx={{ color: '#ffa726', fontFamily: 'monospace', fontWeight: 700, fontSize: 20 }}>
                  {calculations.burstDurationSec.toFixed(1)}s
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Visual Timeline */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Request Timeline (10 seconds)</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 120 }}>
              {timeline.map((t, i) => (
                <Tooltip key={i} title={`Sec ${t.second}: ${t.accepted} accepted, ${t.rejected} rejected`}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column-reverse' }}>
                      <Box sx={{ width: '100%', bgcolor: '#2e7d32', height: `${(t.accepted / maxTimeline) * 100}px`, borderRadius: '2px 2px 0 0' }} />
                      <Box sx={{ width: '100%', bgcolor: '#c62828', height: `${(t.rejected / maxTimeline) * 100}px`, borderRadius: '2px 2px 0 0' }} />
                    </Box>
                    <Typography sx={{ color: 'grey.600', fontSize: 10, mt: 0.5 }}>{t.second}s</Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#2e7d32', borderRadius: 0.5 }} />
                <Typography sx={{ color: 'grey.500', fontSize: 11 }}>Accepted</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#c62828', borderRadius: 0.5 }} />
                <Typography sx={{ color: 'grey.500', fontSize: 11 }}>Rejected</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Config Output */}
        <Paper sx={{ width: 480, bgcolor: '#111', border: '1px solid #222', p: 0, borderRadius: 2, alignSelf: 'flex-start' }}>
          <Tabs value={configTab} onChange={(_, v) => setConfigTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: '1px solid #222', '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', minHeight: 40, fontSize: 12 }, '& .Mui-selected': { color: '#42a5f5' } }}>
            {configs.map((c, i) => <Tab key={i} label={c.label} />)}
          </Tabs>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Tooltip title="Copy config">
                <IconButton size="small" onClick={() => copy(configs[configTab].code)} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1, p: 2, maxHeight: 500, overflow: 'auto' }}>
              <Typography component="pre" sx={{ color: '#98c379', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', m: 0 }}>
                {configs[configTab].code}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
