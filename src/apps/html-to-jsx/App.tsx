import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Home,
  ContentCopy,
  SwapHoriz,
  Clear,
} from '@mui/icons-material';

const ATTR_MAP: Record<string, string> = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly',
  maxlength: 'maxLength', cellpadding: 'cellPadding', cellspacing: 'cellSpacing',
  rowspan: 'rowSpan', colspan: 'colSpan', enctype: 'encType', contenteditable: 'contentEditable',
  crossorigin: 'crossOrigin', accesskey: 'accessKey', autocomplete: 'autoComplete',
  autofocus: 'autoFocus', autoplay: 'autoPlay', formaction: 'formAction',
  novalidate: 'noValidate', spellcheck: 'spellCheck', srcset: 'srcSet',
};

const EVENT_MAP: Record<string, string> = {
  onclick: 'onClick', onchange: 'onChange', onsubmit: 'onSubmit', onfocus: 'onFocus',
  onblur: 'onBlur', onkeydown: 'onKeyDown', onkeyup: 'onKeyUp', onkeypress: 'onKeyPress',
  onmouseover: 'onMouseOver', onmouseout: 'onMouseOut', onmousedown: 'onMouseDown',
  onmouseup: 'onMouseUp', ondblclick: 'onDoubleClick', oninput: 'onInput',
  onscroll: 'onScroll', onload: 'onLoad', onerror: 'onError',
};

const SELF_CLOSING = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);

function convertStyleString(style: string): string {
  const props = style.split(';').filter(s => s.trim());
  const entries = props.map(prop => {
    const [rawKey, ...valParts] = prop.split(':');
    const key = rawKey.trim();
    const value = valParts.join(':').trim();
    if (!key || !value) return null;
    const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const isNum = /^-?\d+(\.\d+)?(px)?$/.test(value);
    const numVal = isNum ? value.replace('px', '') : null;
    if (numVal && !value.includes('%') && !value.includes('em') && !value.includes('rem')) {
      return `${camelKey}: ${numVal}`;
    }
    return `${camelKey}: '${value}'`;
  }).filter(Boolean);
  return `{{ ${entries.join(', ')} }}`;
}

function htmlToJsx(html: string): string {
  let result = html;

  // Remove HTML comments
  result = result.replace(/<!--[\s\S]*?-->/g, (match) => {
    const content = match.slice(4, -3).trim();
    return `{/* ${content} */}`;
  });

  // Convert style attributes
  result = result.replace(/style="([^"]*)"/g, (_, styleStr) => {
    return `style=${convertStyleString(styleStr)}`;
  });
  result = result.replace(/style='([^']*)'/g, (_, styleStr) => {
    return `style=${convertStyleString(styleStr)}`;
  });

  // Convert known attributes
  Object.entries(ATTR_MAP).forEach(([html_attr, jsx_attr]) => {
    const re = new RegExp(`\\b${html_attr}=`, 'gi');
    result = result.replace(re, `${jsx_attr}=`);
    // Handle boolean attributes (e.g., readonly without value)
    const reBool = new RegExp(`(<[^>]*?)\\b${html_attr}\\b(?=[\\s/>])`, 'gi');
    result = result.replace(reBool, `$1${jsx_attr}`);
  });

  // Convert event handlers
  Object.entries(EVENT_MAP).forEach(([html_ev, jsx_ev]) => {
    const re = new RegExp(`\\b${html_ev}="([^"]*)"`, 'gi');
    result = result.replace(re, `${jsx_ev}={($1) => { $1 }}`);
    const re2 = new RegExp(`\\b${html_ev}='([^']*)'`, 'gi');
    result = result.replace(re2, `${jsx_ev}={($1) => { $1 }}`);
  });

  // Self-closing tags
  SELF_CLOSING.forEach(tag => {
    const re = new RegExp(`<(${tag})(\\s[^>]*)?\\/?>(?!\\s*<\\/${tag}>)`, 'gi');
    result = result.replace(re, (_, t, attrs) => `<${t}${attrs || ''} />`);
  });

  return result;
}

function wrapInComponent(jsx: string, name: string, arrow: boolean, ts: boolean): string {
  const returnType = ts ? ': JSX.Element' : '';
  const lines: string[] = [];
  lines.push("import React from 'react';");
  lines.push('');
  if (arrow) {
    lines.push(`const ${name} = ()${returnType} => {`);
    lines.push('  return (');
    jsx.split('\n').forEach(l => lines.push(`    ${l}`));
    lines.push('  );');
    lines.push('};');
    lines.push('');
    lines.push(`export default ${name};`);
  } else {
    lines.push(`export default function ${name}()${returnType} {`);
    lines.push('  return (');
    jsx.split('\n').forEach(l => lines.push(`    ${l}`));
    lines.push('  );');
    lines.push('}');
  }
  return lines.join('\n');
}

const SAMPLE_HTML = `<div class="container">
  <h1 style="color: red; font-size: 24px">Hello World</h1>
  <label for="name">Name:</label>
  <input type="text" id="name" tabindex="1" readonly>
  <img src="photo.jpg" alt="Photo">
  <br>
  <!-- This is a comment -->
  <button onclick="handleClick()">Submit</button>
</div>`;

export default function HtmlToJsx() {
  const [input, setInput] = useState('');
  const [tsMode, setTsMode] = useState(false);
  const [wrapComponent, setWrapComponent] = useState(false);
  const [arrowFn, setArrowFn] = useState(false);
  const [componentName, setComponentName] = useState('MyComponent');
  const [snackOpen, setSnackOpen] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return '';
    const jsx = htmlToJsx(input);
    if (wrapComponent) return wrapInComponent(jsx, componentName, arrowFn, tsMode);
    return jsx;
  }, [input, tsMode, wrapComponent, arrowFn, componentName]);

  const transformations = useMemo(() => {
    if (!input.trim()) return [];
    const found: string[] = [];
    if (/\bclass=/.test(input)) found.push('class -> className');
    if (/\bfor=/.test(input)) found.push('for -> htmlFor');
    if (/style="/.test(input)) found.push('style string -> object');
    if (/\btabindex\b/i.test(input)) found.push('tabindex -> tabIndex');
    if (/\bonclick\b/i.test(input)) found.push('onclick -> onClick');
    if (/<!--/.test(input)) found.push('HTML comments -> JSX');
    SELF_CLOSING.forEach(tag => { if (new RegExp(`<${tag}[\\s>]`, 'i').test(input)) found.push(`<${tag}> -> <${tag} />`); });
    return found;
  }, [input]);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setSnackOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <SwapHoriz sx={{ color: '#8b5cf6' }} />
          <Typography variant="h5" fontWeight={700}>HTML to JSX Converter</Typography>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <FormControlLabel control={<Switch checked={tsMode} onChange={e => setTsMode(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' } }} />} label={<Typography variant="body2" color="grey.400">TypeScript</Typography>} />
          <FormControlLabel control={<Switch checked={wrapComponent} onChange={e => setWrapComponent(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' } }} />} label={<Typography variant="body2" color="grey.400">Wrap in Component</Typography>} />
          {wrapComponent && (
            <>
              <FormControlLabel control={<Switch checked={arrowFn} onChange={e => setArrowFn(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' } }} />} label={<Typography variant="body2" color="grey.400">Arrow Function</Typography>} />
              <TextField size="small" value={componentName} onChange={e => setComponentName(e.target.value)} label="Component Name"
                sx={{ width: 180, '& .MuiInputBase-root': { bgcolor: '#0d0d0d', color: 'grey.300', fontSize: 13 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }}
              />
            </>
          )}
          <Box sx={{ flex: 1 }} />
          <Button size="small" variant="outlined" sx={{ borderColor: '#333', color: 'grey.400', textTransform: 'none' }} onClick={() => setInput(SAMPLE_HTML)}>Load Sample</Button>
          <Tooltip title="Clear"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={() => setInput('')}><Clear /></IconButton></Tooltip>
        </Paper>

        {transformations.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {transformations.map(t => <Chip key={t} label={t} size="small" sx={{ bgcolor: '#8b5cf610', color: '#8b5cf6', fontSize: 11 }} />)}
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" color="grey.400" mb={1}>HTML Input</Typography>
            <TextField
              multiline rows={20} fullWidth value={input} onChange={e => setInput(e.target.value)}
              placeholder="Paste your HTML here..."
              sx={{ '& .MuiInputBase-root': { bgcolor: '#0d0d0d', fontFamily: 'monospace', fontSize: 13, color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#222' } }}
            />
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="grey.400">JSX Output</Typography>
              <Tooltip title="Copy"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={copy}><ContentCopy /></IconButton></Tooltip>
            </Box>
            <Box sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 1, p: 2, fontFamily: 'monospace', fontSize: 13, color: '#a5f3fc', whiteSpace: 'pre-wrap', minHeight: 460, maxHeight: 600, overflow: 'auto' }}>
              {output || <Typography color="grey.600" fontSize={13}>JSX output will appear here</Typography>}
            </Box>
          </Paper>
        </Box>
      </Box>
      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
