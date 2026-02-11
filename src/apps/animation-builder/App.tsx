import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Chip,
  Slider,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete, PlayArrow, Refresh } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Keyframe {
  percent: number;
  transform: string;
  opacity: string;
  backgroundColor: string;
  borderRadius: string;
  boxShadow: string;
  width: string;
  height: string;
}

const emptyKeyframe = (percent: number): Keyframe => ({
  percent, transform: '', opacity: '', backgroundColor: '', borderRadius: '', boxShadow: '', width: '', height: '',
});

const TIMING_FUNCTIONS = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'];
const DIRECTIONS = ['normal', 'reverse', 'alternate', 'alternate-reverse'];
const FILL_MODES = ['none', 'forwards', 'backwards', 'both'];

const PRESETS: Record<string, { frames: Keyframe[]; duration: string; timing: string; iterationCount: string; direction: string; fillMode: string }> = {
  bounce: {
    frames: [
      { ...emptyKeyframe(0), transform: 'translateY(0)' },
      { ...emptyKeyframe(50), transform: 'translateY(-40px)' },
      { ...emptyKeyframe(100), transform: 'translateY(0)' },
    ],
    duration: '0.6s', timing: 'ease', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  'fade-in': {
    frames: [{ ...emptyKeyframe(0), opacity: '0' }, { ...emptyKeyframe(100), opacity: '1' }],
    duration: '1s', timing: 'ease-in', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  'slide-in': {
    frames: [
      { ...emptyKeyframe(0), transform: 'translateX(-100px)', opacity: '0' },
      { ...emptyKeyframe(100), transform: 'translateX(0)', opacity: '1' },
    ],
    duration: '0.5s', timing: 'ease-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
  spin: {
    frames: [{ ...emptyKeyframe(0), transform: 'rotate(0deg)' }, { ...emptyKeyframe(100), transform: 'rotate(360deg)' }],
    duration: '1s', timing: 'linear', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  pulse: {
    frames: [
      { ...emptyKeyframe(0), transform: 'scale(1)' },
      { ...emptyKeyframe(50), transform: 'scale(1.15)' },
      { ...emptyKeyframe(100), transform: 'scale(1)' },
    ],
    duration: '1s', timing: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none',
  },
  shake: {
    frames: [
      { ...emptyKeyframe(0), transform: 'translateX(0)' },
      { ...emptyKeyframe(25), transform: 'translateX(-10px)' },
      { ...emptyKeyframe(50), transform: 'translateX(10px)' },
      { ...emptyKeyframe(75), transform: 'translateX(-10px)' },
      { ...emptyKeyframe(100), transform: 'translateX(0)' },
    ],
    duration: '0.4s', timing: 'ease-in-out', iterationCount: '1', direction: 'normal', fillMode: 'none',
  },
  flip: {
    frames: [
      { ...emptyKeyframe(0), transform: 'perspective(400px) rotateY(0)' },
      { ...emptyKeyframe(100), transform: 'perspective(400px) rotateY(360deg)' },
    ],
    duration: '1s', timing: 'ease-in-out', iterationCount: '1', direction: 'normal', fillMode: 'forwards',
  },
};

export default function AnimationBuilder() {
  const [name, setName] = useState('myAnimation');
  const [duration, setDuration] = useState('1s');
  const [timing, setTiming] = useState('ease');
  const [delay, setDelay] = useState('0s');
  const [iterationCount, setIterationCount] = useState('1');
  const [direction, setDirection] = useState('normal');
  const [fillMode, setFillMode] = useState('none');
  const [keyframes, setKeyframes] = useState<Keyframe[]>([emptyKeyframe(0), emptyKeyframe(100)]);
  const [selectedKf, setSelectedKf] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const addKeyframe = () => {
    const percents = keyframes.map((k) => k.percent);
    let next = 50;
    while (percents.includes(next) && next < 100) next += 5;
    if (next >= 100) return;
    const updated = [...keyframes, emptyKeyframe(next)].sort((a, b) => a.percent - b.percent);
    setKeyframes(updated);
    setSelectedKf(updated.findIndex((k) => k.percent === next));
  };

  const removeKeyframe = (index: number) => {
    if (keyframes.length <= 2) return;
    const updated = keyframes.filter((_, i) => i !== index);
    setKeyframes(updated);
    setSelectedKf(Math.min(selectedKf, updated.length - 1));
  };

  const updateKeyframe = (field: keyof Keyframe, value: string | number) => {
    setKeyframes(keyframes.map((k, i) =>
      i === selectedKf ? { ...k, [field]: field === 'percent' ? Number(value) : value } : k
    ));
  };

  const loadPreset = (presetName: string) => {
    const p = PRESETS[presetName];
    if (!p) return;
    setName(presetName);
    setKeyframes(p.frames);
    setDuration(p.duration);
    setTiming(p.timing);
    setIterationCount(p.iterationCount);
    setDirection(p.direction);
    setFillMode(p.fillMode);
    setSelectedKf(0);
    setAnimKey((k) => k + 1);
  };

  const generatedCSS = useMemo(() => {
    const kfLines = keyframes.map((k) => {
      const props: string[] = [];
      if (k.transform) props.push(`    transform: ${k.transform};`);
      if (k.opacity) props.push(`    opacity: ${k.opacity};`);
      if (k.backgroundColor) props.push(`    background-color: ${k.backgroundColor};`);
      if (k.borderRadius) props.push(`    border-radius: ${k.borderRadius};`);
      if (k.boxShadow) props.push(`    box-shadow: ${k.boxShadow};`);
      if (k.width) props.push(`    width: ${k.width};`);
      if (k.height) props.push(`    height: ${k.height};`);
      return `  ${k.percent}% {\n${props.join('\n')}\n  }`;
    });
    return `@keyframes ${name} {\n${kfLines.join('\n')}\n}\n\n.animated-element {\n  animation: ${name} ${duration} ${timing} ${delay} ${iterationCount} ${direction} ${fillMode};\n}`;
  }, [name, duration, timing, delay, iterationCount, direction, fillMode, keyframes]);

  const previewStyle = useMemo(() => {
    const style = document.createElement('style');
    style.textContent = generatedCSS;
    return style;
  }, [generatedCSS]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCSS);
    setSnackbar({ open: true, message: 'CSS copied to clipboard' });
  };

  const kf = keyframes[selectedKf];

  const PropField = ({ label, field }: { label: string; field: keyof Keyframe }) => (
    <TextField size="small" fullWidth label={label} value={kf[field]} onChange={(e) => updateKeyframe(field, e.target.value)}
      sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
  );

  const AnimSelect = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
    <FormControl size="small" fullWidth sx={{ mb: 1 }}>
      <InputLabel sx={{ color: 'grey.500' }}>{label}</InputLabel>
      <Select value={value} label={label} onChange={(e) => onChange(e.target.value as string)}
        sx={{ color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
        {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>CSS Animation Builder</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<Refresh />} onClick={() => setAnimKey((k) => k + 1)} sx={{ color: 'grey.400' }}>Replay</Button>
            <Button startIcon={<ContentCopy />} onClick={handleCopy} sx={{ color: 'grey.400' }}>Copy CSS</Button>
          </Box>
        </Box>
      </Paper>

      {/* Presets bar */}
      <Paper elevation={0} sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222', px: 3, py: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: 'grey.500', mr: 1 }}>Presets:</Typography>
          {Object.keys(PRESETS).map((p) => (
            <Chip key={p} label={p} size="small" onClick={() => loadPreset(p)}
              sx={{ bgcolor: '#222', color: 'grey.300', '&:hover': { bgcolor: '#333' } }} />
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, p: 2, height: 'calc(100vh - 130px)' }}>
        {/* Animation Properties */}
        <Paper sx={{ width: 260, bgcolor: '#111', border: '1px solid #222', p: 2, overflowY: 'auto', flexShrink: 0 }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Animation Properties</Typography>
          <TextField size="small" fullWidth label="name" value={name} onChange={(e) => setName(e.target.value)}
            sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
          <TextField size="small" fullWidth label="duration" value={duration} onChange={(e) => setDuration(e.target.value)}
            sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
          <AnimSelect label="timing-function" value={timing} options={TIMING_FUNCTIONS} onChange={setTiming} />
          <TextField size="small" fullWidth label="delay" value={delay} onChange={(e) => setDelay(e.target.value)}
            sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
          <TextField size="small" fullWidth label="iteration-count" value={iterationCount} onChange={(e) => setIterationCount(e.target.value)}
            placeholder="number or infinite"
            sx={{ mb: 1, '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }} />
          <AnimSelect label="direction" value={direction} options={DIRECTIONS} onChange={setDirection} />
          <AnimSelect label="fill-mode" value={fillMode} options={FILL_MODES} onChange={setFillMode} />
        </Paper>

        {/* Keyframes Editor */}
        <Paper sx={{ width: 260, bgcolor: '#111', border: '1px solid #222', p: 2, overflowY: 'auto', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Keyframes</Typography>
            <IconButton size="small" onClick={addKeyframe} sx={{ color: 'grey.400' }}><Add fontSize="small" /></IconButton>
          </Box>

          {/* Keyframe timeline */}
          <Box sx={{ mb: 2, position: 'relative', height: 30, bgcolor: '#1a1a1a', borderRadius: 1 }}>
            {keyframes.map((k, i) => (
              <Box key={i} onClick={() => setSelectedKf(i)}
                sx={{
                  position: 'absolute', left: `${k.percent}%`, top: '50%', transform: 'translate(-50%, -50%)',
                  width: 14, height: 14, borderRadius: '50%', cursor: 'pointer',
                  bgcolor: selectedKf === i ? '#61afef' : '#555', border: '2px solid', borderColor: selectedKf === i ? '#61afef' : '#777',
                  transition: 'all 0.2s',
                }} />
            ))}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {keyframes.map((k, i) => (
              <Chip key={i} label={`${k.percent}%`} size="small"
                onClick={() => setSelectedKf(i)}
                onDelete={keyframes.length > 2 ? () => removeKeyframe(i) : undefined}
                sx={{ bgcolor: selectedKf === i ? '#1a3a5c' : '#222', color: selectedKf === i ? '#61afef' : 'grey.400', '& .MuiChip-deleteIcon': { color: 'grey.600' } }} />
            ))}
          </Box>

          {kf && (
            <Box>
              <Typography variant="caption" sx={{ color: '#61afef', mb: 1, display: 'block' }}>Keyframe at {kf.percent}%</Typography>
              <Typography variant="caption" sx={{ color: 'grey.500', mb: 0.5, display: 'block' }}>Position (%)</Typography>
              <Slider value={kf.percent} min={0} max={100} onChange={(_, v) => updateKeyframe('percent', v as number)}
                sx={{ color: '#61afef', mb: 1 }} />
              <PropField label="transform" field="transform" />
              <PropField label="opacity" field="opacity" />
              <PropField label="background-color" field="backgroundColor" />
              <PropField label="border-radius" field="borderRadius" />
              <PropField label="box-shadow" field="boxShadow" />
              <PropField label="width" field="width" />
              <PropField label="height" field="height" />
            </Box>
          )}
        </Paper>

        {/* Preview + Code */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          {/* Live Preview */}
          <Paper sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <style>{generatedCSS.replace('.animated-element', `.anim-preview-${animKey}`)}</style>
            <Box key={animKey} className={`anim-preview-${animKey}`}
              sx={{ width: 80, height: 80, bgcolor: '#61afef', borderRadius: 1 }} />
          </Paper>

          {/* Generated CSS */}
          <Paper sx={{ height: 220, bgcolor: '#111', border: '1px solid #222', p: 2, overflow: 'auto', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.500' }}>Generated CSS</Typography>
              <Tooltip title="Copy"><IconButton size="small" onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#98c379', whiteSpace: 'pre-wrap', m: 0 }}>
              {generatedCSS}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
