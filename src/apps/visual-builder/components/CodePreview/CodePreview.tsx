import { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import '@/utils/monacoConfig'; // Enable offline Monaco support
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useBuilderStore } from '../../store/useBuilderStore';
import { generateCode, generateProjectStructure } from '../../utils/codeGenerator';

export function CodePreview() {
  const { components, codeFormat, setCodeFormat } = useBuilderStore();
  const [activeTab, setActiveTab] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const generatedCode = useMemo(() => generateCode(components), [components]);
  const projectStructure = useMemo(() => generateProjectStructure(components), [components]);

  const handleFormatChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFormat: 'tsx' | 'jsx' | 'jquery' | null
  ) => {
    if (newFormat) {
      setCodeFormat(newFormat);
    }
  };

  const getCurrentCode = (): string => {
    switch (activeTab) {
      case 0: // Components
        if (codeFormat === 'tsx') return generatedCode.tsx;
        if (codeFormat === 'jsx') return generatedCode.jsx;
        return generatedCode.jquery;
      case 1: // App
        if (codeFormat === 'tsx') return generatedCode.appCode.tsx;
        if (codeFormat === 'jsx') return generatedCode.appCode.jsx;
        return generatedCode.appCode.jquery;
      case 2: // Structure
        return projectStructure;
      default:
        return '';
    }
  };

  const getEditorLanguage = (): string => {
    if (activeTab === 2) return 'plaintext';
    if (codeFormat === 'jquery') return 'html';
    return 'typescript';
  };

  const getTabLabel = (tabIndex: number): string => {
    if (codeFormat === 'jquery') {
      switch (tabIndex) {
        case 0: return 'Components';
        case 1: return 'index.html';
        case 2: return 'Structure';
        default: return '';
      }
    }
    const ext = codeFormat === 'tsx' ? 'tsx' : 'jsx';
    switch (tabIndex) {
      case 0: return 'Components';
      case 1: return `App.${ext}`;
      case 2: return 'Structure';
      default: return '';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentCode());
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const code = getCurrentCode();
    let fileName: string;

    if (activeTab === 2) {
      fileName = 'project-structure.txt';
    } else if (codeFormat === 'jquery') {
      fileName = activeTab === 0 ? 'components.html' : 'index.html';
    } else {
      const ext = codeFormat;
      fileName = activeTab === 0 ? `components.${ext}` : `App.${ext}`;
    }

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Code Preview
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ToggleButtonGroup
            value={codeFormat}
            exclusive
            onChange={handleFormatChange}
            size="small"
          >
            <ToggleButton value="tsx">TSX</ToggleButton>
            <ToggleButton value="jsx">JSX</ToggleButton>
            <ToggleButton value="jquery">jQuery</ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Copy to clipboard">
            <IconButton size="small" onClick={handleCopy}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download file">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={getTabLabel(0)} />
        <Tab label={getTabLabel(1)} />
        <Tab label={getTabLabel(2)} />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={getEditorLanguage()}
          theme="vs-dark"
          value={getCurrentCode()}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            folding: true,
            tabSize: 2,
          }}
        />
      </Box>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setCopySuccess(false)}>
          Code copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
