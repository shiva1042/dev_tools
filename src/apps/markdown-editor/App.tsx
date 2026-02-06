import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Download,
  Upload,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Title,
  FormatQuote,
  HorizontalRule,
  TableChart,
  CheckBox,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type ViewMode = 'edit' | 'preview' | 'split';

const sampleMarkdown = `# Welcome to Markdown Editor

This is a **live preview** markdown editor. You can write markdown on the left and see the rendered output on the right.

## Features

- **Bold** and *italic* text
- [Links](https://example.com)
- Lists (ordered and unordered)
- Code blocks
- Tables
- And more!

### Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

### Table Example

| Name | Age | City |
|------|-----|------|
| John | 30  | NYC  |
| Jane | 25  | LA   |
| Bob  | 35  | SF   |

### Task List

- [x] Create markdown editor
- [x] Add live preview
- [ ] Add more features

> **Note:** This is a blockquote. It's great for highlighting important information.

---

*Happy writing!*
`;

// Simple markdown to HTML converter
const markdownToHtml = (md: string): string => {
  let html = md;

  // Escape HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks (must be done before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Links and images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Task lists
  html = html.replace(/^- \[x\] (.+)$/gm, '<div class="task"><input type="checkbox" checked disabled> $1</div>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<div class="task"><input type="checkbox" disabled> $1</div>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map((cell: string) => cell.trim());
    if (cells.every((cell: string) => /^-+$/.test(cell))) {
      return '<!-- table separator -->';
    }
    const isHeader = !html.includes('<!-- table separator -->') ||
      html.lastIndexOf('<table>') > html.lastIndexOf('</table>');
    const cellTag = isHeader ? 'th' : 'td';
    const row = cells.map((cell: string) => `<${cellTag}>${cell}</${cellTag}>`).join('');
    return `<tr>${row}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>');
  html = html.replace(/<!-- table separator -->\n?/g, '');

  // Paragraphs (must be done last)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>');

  // Clean up multiple line breaks
  html = html.replace(/\n\n+/g, '\n');

  return html;
};

const previewStyles = `
  .preview {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #d4d4d4;
  }
  .preview h1, .preview h2, .preview h3, .preview h4, .preview h5, .preview h6 {
    color: #fff;
    margin: 1.5em 0 0.5em;
    font-weight: 600;
  }
  .preview h1 { font-size: 2em; border-bottom: 1px solid #333; padding-bottom: 0.3em; }
  .preview h2 { font-size: 1.5em; border-bottom: 1px solid #333; padding-bottom: 0.3em; }
  .preview h3 { font-size: 1.25em; }
  .preview p { margin: 1em 0; }
  .preview a { color: #61afef; text-decoration: none; }
  .preview a:hover { text-decoration: underline; }
  .preview code.inline-code {
    background: #2a2a2a;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
    color: #e06c75;
  }
  .preview pre.code-block {
    background: #1a1a1a;
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    border: 1px solid #333;
  }
  .preview pre.code-block code {
    color: #abb2bf;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
  }
  .preview blockquote {
    border-left: 4px solid #61afef;
    margin: 1em 0;
    padding: 0.5em 1em;
    background: #1a1a1a;
    color: #9ca3af;
  }
  .preview ul, .preview ol {
    margin: 1em 0;
    padding-left: 2em;
  }
  .preview li { margin: 0.25em 0; }
  .preview hr {
    border: none;
    border-top: 1px solid #333;
    margin: 2em 0;
  }
  .preview table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }
  .preview th, .preview td {
    border: 1px solid #333;
    padding: 0.5em 1em;
    text-align: left;
  }
  .preview th {
    background: #1a1a1a;
    font-weight: 600;
  }
  .preview .task {
    display: flex;
    align-items: center;
    gap: 0.5em;
    margin: 0.25em 0;
  }
  .preview img {
    max-width: 100%;
    border-radius: 4px;
  }
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState<string>(sampleMarkdown);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const html = useMemo(() => markdownToHtml(markdown), [markdown]);

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end) || placeholder;
    const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end);
    setMarkdown(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied` });
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkdown(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const toolbarButtons = [
    { icon: <FormatBold />, action: () => insertText('**', '**', 'bold'), tooltip: 'Bold' },
    { icon: <FormatItalic />, action: () => insertText('*', '*', 'italic'), tooltip: 'Italic' },
    { divider: true },
    { icon: <Title />, action: () => insertText('## ', '', 'Heading'), tooltip: 'Heading' },
    { icon: <FormatQuote />, action: () => insertText('> ', '', 'quote'), tooltip: 'Quote' },
    { icon: <Code />, action: () => insertText('`', '`', 'code'), tooltip: 'Inline Code' },
    { divider: true },
    { icon: <FormatListBulleted />, action: () => insertText('- ', '', 'item'), tooltip: 'Bullet List' },
    { icon: <FormatListNumbered />, action: () => insertText('1. ', '', 'item'), tooltip: 'Numbered List' },
    { icon: <CheckBox />, action: () => insertText('- [ ] ', '', 'task'), tooltip: 'Task' },
    { divider: true },
    { icon: <LinkIcon />, action: () => insertText('[', '](url)', 'link text'), tooltip: 'Link' },
    { icon: <ImageIcon />, action: () => insertText('![', '](url)', 'alt text'), tooltip: 'Image' },
    { icon: <TableChart />, action: () => insertText('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', '', ''), tooltip: 'Table' },
    { icon: <HorizontalRule />, action: () => insertText('\n---\n', '', ''), tooltip: 'Horizontal Rule' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/">
              <IconButton size="small" sx={{ color: 'grey.500' }}>
                <Home />
              </IconButton>
            </Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              Markdown Editor
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="edit" sx={{ color: 'grey.400' }}>
                <Edit sx={{ fontSize: 18, mr: 0.5 }} /> Edit
              </ToggleButton>
              <ToggleButton value="split" sx={{ color: 'grey.400' }}>
                Split
              </ToggleButton>
              <ToggleButton value="preview" sx={{ color: 'grey.400' }}>
                <Visibility sx={{ fontSize: 18, mr: 0.5 }} /> Preview
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#0d0d0d',
          borderBottom: '1px solid #222',
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {toolbarButtons.map((btn, i) =>
          btn.divider ? (
            <Divider key={i} orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#333' }} />
          ) : (
            <Tooltip key={i} title={btn.tooltip || ''}>
              <IconButton size="small" onClick={btn.action} sx={{ color: 'grey.500' }}>
                {btn.icon}
              </IconButton>
            </Tooltip>
          )
        )}
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Upload">
          <IconButton size="small" component="label" sx={{ color: 'grey.500' }}>
            <Upload fontSize="small" />
            <input type="file" hidden accept=".md,.markdown,.txt" onChange={handleUpload} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download Markdown">
          <IconButton size="small" onClick={() => handleDownload(markdown, 'document.md')} sx={{ color: 'grey.500' }}>
            <Download fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy Markdown">
          <IconButton size="small" onClick={() => handleCopy(markdown, 'Markdown')} sx={{ color: 'grey.500' }}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Editor & Preview */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
            <TextField
              multiline
              fullWidth
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your markdown here..."
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  bgcolor: '#111',
                  color: '#d4d4d4',
                  lineHeight: 1.6,
                },
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflow: 'auto !important',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333',
                },
              }}
            />
          </Box>
        )}

        {/* Divider */}
        {viewMode === 'split' && (
          <Box sx={{ width: 1, bgcolor: '#333' }} />
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 3, minHeight: '100%' }}>
              <style>{previewStyles}</style>
              <div
                className="preview"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </Paper>
          </Box>
        )}
      </Box>

      {/* Stats */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#111',
          borderTop: '1px solid #222',
          px: 3,
          py: 1,
          display: 'flex',
          gap: 3,
        }}
      >
        <Typography variant="caption" sx={{ color: 'grey.600' }}>
          {markdown.length} characters
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.600' }}>
          {markdown.split(/\s+/).filter(Boolean).length} words
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.600' }}>
          {markdown.split('\n').length} lines
        </Typography>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
