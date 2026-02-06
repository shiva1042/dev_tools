import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  ExpandMore,
  Check,
  Error as ErrorIcon,
  Lightbulb,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface RegexFlags {
  global: boolean;
  caseInsensitive: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
  sticky: boolean;
}

interface MatchResult {
  match: string;
  index: number;
  groups: Record<string, string> | undefined;
}

interface RegexTemplate {
  name: string;
  pattern: string;
  description: string;
}

const templates: { category: string; items: RegexTemplate[] }[] = [
  {
    category: 'Common Patterns',
    items: [
      { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: 'Match email addresses' },
      { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', description: 'Match URLs' },
      { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-\\s.]?\\d{3}[-\\s.]?\\d{4}', description: 'Match US phone numbers' },
      { name: 'IPv4 Address', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', description: 'Match IPv4 addresses' },
      { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', description: 'Match ISO date format' },
      { name: 'Time (HH:MM)', pattern: '(?:[01]\\d|2[0-3]):[0-5]\\d', description: 'Match 24-hour time' },
    ],
  },
  {
    category: 'Validation',
    items: [
      { name: 'Username', pattern: '^[a-zA-Z0-9_]{3,16}$', description: '3-16 alphanumeric characters' },
      { name: 'Password (Strong)', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', description: 'Min 8 chars, upper, lower, digit, special' },
      { name: 'Hex Color', pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$', description: 'Match hex color codes' },
      { name: 'Credit Card', pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$', description: 'Visa, Mastercard, Amex' },
      { name: 'UUID', pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$', description: 'Match UUID format' },
    ],
  },
  {
    category: 'Programming',
    items: [
      { name: 'HTML Tag', pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)', description: 'Match HTML tags' },
      { name: 'CSS Selector', pattern: '[.#]?[a-zA-Z][a-zA-Z0-9_-]*', description: 'Match CSS selectors' },
      { name: 'JS Variable', pattern: '\\b[a-zA-Z_$][a-zA-Z0-9_$]*\\b', description: 'Match JS variable names' },
      { name: 'Import Statement', pattern: "import\\s+(?:{[^}]+}|\\*\\s+as\\s+\\w+|\\w+)\\s+from\\s+['\"][^'\"]+['\"]", description: 'Match ES6 imports' },
      { name: 'Function Definition', pattern: '(?:function\\s+\\w+|(?:const|let|var)\\s+\\w+\\s*=\\s*(?:async\\s+)?(?:function|\\([^)]*\\)\\s*=>))', description: 'Match function definitions' },
    ],
  },
  {
    category: 'Text Processing',
    items: [
      { name: 'Words Only', pattern: '\\b\\w+\\b', description: 'Match whole words' },
      { name: 'Sentences', pattern: '[A-Z][^.!?]*[.!?]', description: 'Match sentences' },
      { name: 'Whitespace', pattern: '\\s+', description: 'Match whitespace' },
      { name: 'Line Breaks', pattern: '\\r?\\n', description: 'Match line breaks' },
      { name: 'Quoted Strings', pattern: '"[^"]*"|\'[^\']*\'', description: 'Match quoted strings' },
      { name: 'Numbers', pattern: '-?\\d+(?:\\.\\d+)?', description: 'Match integers and decimals' },
    ],
  },
];

const patternExplanations: Record<string, string> = {
  '.': 'Any character except newline',
  '\\d': 'Digit (0-9)',
  '\\D': 'Non-digit',
  '\\w': 'Word character (a-z, A-Z, 0-9, _)',
  '\\W': 'Non-word character',
  '\\s': 'Whitespace',
  '\\S': 'Non-whitespace',
  '\\b': 'Word boundary',
  '\\B': 'Non-word boundary',
  '^': 'Start of string/line',
  '$': 'End of string/line',
  '*': '0 or more',
  '+': '1 or more',
  '?': '0 or 1 (optional)',
  '{n}': 'Exactly n times',
  '{n,}': 'n or more times',
  '{n,m}': 'Between n and m times',
  '[]': 'Character class',
  '[^]': 'Negated character class',
  '|': 'Alternation (OR)',
  '()': 'Capturing group',
  '(?:)': 'Non-capturing group',
  '(?=)': 'Positive lookahead',
  '(?!)': 'Negative lookahead',
  '(?<=)': 'Positive lookbehind',
  '(?<!)': 'Negative lookbehind',
};

export default function RegexBuilder() {
  const [pattern, setPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [testString, setTestString] = useState<string>('Contact us at support@example.com or sales@company.org\nInvalid: not-an-email, @missing.com');
  const [flags, setFlags] = useState<RegexFlags>({
    global: true,
    caseInsensitive: false,
    multiline: true,
    dotAll: false,
    unicode: false,
    sticky: false,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const flagString = useMemo(() => {
    let f = '';
    if (flags.global) f += 'g';
    if (flags.caseInsensitive) f += 'i';
    if (flags.multiline) f += 'm';
    if (flags.dotAll) f += 's';
    if (flags.unicode) f += 'u';
    if (flags.sticky) f += 'y';
    return f;
  }, [flags]);

  const { regex, error, matches, highlightedText } = useMemo(() => {
    try {
      const rx = new RegExp(pattern, flagString);
      const matchResults: MatchResult[] = [];
      let match;
      const rxForMatches = new RegExp(pattern, flagString.includes('g') ? flagString : flagString + 'g');

      while ((match = rxForMatches.exec(testString)) !== null) {
        matchResults.push({
          match: match[0],
          index: match.index,
          groups: match.groups,
        });
        if (!flagString.includes('g')) break;
      }

      // Create highlighted text
      let highlighted = testString;
      let offset = 0;
      const parts: { text: string; isMatch: boolean }[] = [];
      let lastIndex = 0;

      for (const m of matchResults) {
        if (m.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, m.index), isMatch: false });
        }
        parts.push({ text: m.match, isMatch: true });
        lastIndex = m.index + m.match.length;
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false });
      }

      return { regex: rx, error: null, matches: matchResults, highlightedText: parts };
    } catch (e) {
      return { regex: null, error: (e as Error).message, matches: [], highlightedText: [] };
    }
  }, [pattern, flagString, testString]);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard` });
  };

  const handleTemplateClick = (template: RegexTemplate) => {
    setPattern(template.pattern);
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
            Regex Builder
          </Typography>
          <Chip
            icon={error ? <ErrorIcon /> : <Check />}
            label={error ? 'Invalid' : `${matches.length} match${matches.length !== 1 ? 'es' : ''}`}
            size="small"
            color={error ? 'error' : 'success'}
            variant="outlined"
          />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Left Panel - Pattern & Test */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Pattern Input */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>
              Regular Expression
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: 'grey.500', fontFamily: 'monospace' }}>/</Typography>
              <TextField
                fullWidth
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                error={!!error}
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: 16,
                    bgcolor: '#0a0a0a',
                    color: '#61afef',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#333',
                  },
                }}
              />
              <Typography sx={{ color: 'grey.500', fontFamily: 'monospace' }}>/{flagString}</Typography>
              <Tooltip title="Copy regex">
                <IconButton
                  size="small"
                  onClick={() => handleCopy(`/${pattern}/${flagString}`, 'Regex')}
                  sx={{ color: 'grey.500' }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            {error && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                {error}
              </Typography>
            )}
          </Paper>

          {/* Flags */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>
              Flags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { key: 'global', label: 'Global (g)', desc: 'Find all matches' },
                { key: 'caseInsensitive', label: 'Case Insensitive (i)', desc: 'Ignore case' },
                { key: 'multiline', label: 'Multiline (m)', desc: '^/$ match line start/end' },
                { key: 'dotAll', label: 'Dot All (s)', desc: '. matches newlines' },
                { key: 'unicode', label: 'Unicode (u)', desc: 'Enable Unicode support' },
                { key: 'sticky', label: 'Sticky (y)', desc: 'Match from lastIndex' },
              ].map(({ key, label, desc }) => (
                <Tooltip key={key} title={desc}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={flags[key as keyof RegexFlags]}
                        onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
                      />
                    }
                    label={<Typography variant="caption" sx={{ color: 'grey.400' }}>{label}</Typography>}
                    sx={{ mr: 2 }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Paper>

          {/* Test String */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>
              Test String
            </Typography>
            <TextField
              multiline
              fullWidth
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against..."
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  bgcolor: '#0a0a0a',
                  color: '#d4d4d4',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333',
                },
              }}
            />
          </Paper>

          {/* Highlighted Results */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, maxHeight: 200, overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>
              Highlighted Matches
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {highlightedText.map((part, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: part.isMatch ? 'rgba(97, 175, 239, 0.3)' : 'transparent',
                    color: part.isMatch ? '#61afef' : '#d4d4d4',
                    borderRadius: part.isMatch ? 2 : 0,
                    padding: part.isMatch ? '0 2px' : 0,
                  }}
                >
                  {part.text}
                </span>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - Templates & Matches */}
        <Box sx={{ width: 350, borderLeft: '1px solid #222', overflow: 'auto' }}>
          {/* Matches */}
          <Paper sx={{ bgcolor: '#0d0d0d', m: 2, border: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', p: 2, borderBottom: '1px solid #222' }}>
              Matches ({matches.length})
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {matches.length === 0 ? (
                <Typography sx={{ p: 2, color: 'grey.600', fontSize: 13 }}>No matches found</Typography>
              ) : (
                matches.map((m, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1.5,
                      borderBottom: '1px solid #222',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#98c379' }}>
                        "{m.match}"
                      </Typography>
                      <Chip label={`@${m.index}`} size="small" sx={{ height: 20, fontSize: 11 }} />
                    </Box>
                    {m.groups && Object.keys(m.groups).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {Object.entries(m.groups).map(([name, value]) => (
                          <Typography key={name} sx={{ fontSize: 11, color: 'grey.500' }}>
                            {name}: {value}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Paper>

          {/* Quick Reference */}
          <Paper sx={{ bgcolor: '#0d0d0d', m: 2, border: '1px solid #222' }}>
            <Accordion sx={{ bgcolor: 'transparent', color: 'grey.400' }} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb sx={{ fontSize: 18 }} />
                  <Typography variant="subtitle2">Quick Reference</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {Object.entries(patternExplanations).map(([token, desc]) => (
                    <Box
                      key={token}
                      sx={{
                        display: 'flex',
                        px: 2,
                        py: 0.75,
                        borderTop: '1px solid #222',
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setPattern(pattern + token.replace(/[(){}]/g, ''));
                      }}
                    >
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#c678dd', width: 60 }}>
                        {token}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'grey.500' }}>{desc}</Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Paper>

          {/* Templates */}
          <Paper sx={{ bgcolor: '#0d0d0d', m: 2, border: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', p: 2, borderBottom: '1px solid #222' }}>
              Templates
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {templates.map((category) => (
                <Accordion key={category.category} sx={{ bgcolor: 'transparent', color: 'grey.400' }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                    <Typography variant="caption">{category.category}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <List dense disablePadding>
                      {category.items.map((item) => (
                        <ListItem key={item.name} disablePadding>
                          <ListItemButton onClick={() => handleTemplateClick(item)} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={item.name}
                              secondary={item.description}
                              primaryTypographyProps={{ fontSize: 13 }}
                              secondaryTypographyProps={{ fontSize: 11 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
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
