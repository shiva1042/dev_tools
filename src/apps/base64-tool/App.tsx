import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Download,
  Upload,
  SwapVert,
  Home,
  TextFields,
  Image as ImageIcon,
  InsertDriveFile,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type Mode = 'encode' | 'decode';
type InputType = 'text' | 'file' | 'image';

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [inputType, setInputType] = useState<InputType>('text');
  const [input, setInput] = useState<string>('Hello, World! This is a test string for Base64 encoding.');
  const [output, setOutput] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const processText = useCallback((text: string, m: Mode) => {
    try {
      if (m === 'encode') {
        // Encode to Base64
        const encoded = btoa(unescape(encodeURIComponent(text)));
        setOutput(encoded);
      } else {
        // Decode from Base64
        const decoded = decodeURIComponent(escape(atob(text)));
        setOutput(decoded);
      }
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (inputType === 'text') {
      processText(value, mode);
    }
  };

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: Mode | null) => {
    if (newMode) {
      setMode(newMode);
      if (inputType === 'text') {
        processText(input, newMode);
      }
    }
  };

  const handleSwap = () => {
    const newInput = output;
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setInput(newInput);
    setMode(newMode);
    processText(newInput, newMode);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();

    if (inputType === 'image') {
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        // Extract base64 part from data URL
        const base64 = result.split(',')[1];
        setOutput(base64);
        setInput(`[Image: ${file.name}]`);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        const result = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(result);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        setOutput(base64);
        setInput(`[File: ${file.name}]`);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDecodeToFile = () => {
    try {
      const binary = atob(input);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'decoded-file';
      a.click();
      URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'File downloaded successfully' });
    } catch (e) {
      setSnackbar({ open: true, message: `Error: ${(e as Error).message}` });
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDataUrl = () => {
    if (imagePreview) return imagePreview;
    if (output && inputType === 'image') {
      return `data:image/png;base64,${output}`;
    }
    return '';
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/">
              <IconButton size="small" sx={{ color: 'grey.500' }}>
                <Home />
              </IconButton>
            </Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              Base64 Encoder/Decoder
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              size="small"
            >
              <ToggleButton value="encode" sx={{ color: 'grey.400' }}>Encode</ToggleButton>
              <ToggleButton value="decode" sx={{ color: 'grey.400' }}>Decode</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Input Type Tabs */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#0d0d0d',
          borderBottom: '1px solid #222',
          px: 3,
        }}
      >
        <Tabs
          value={inputType}
          onChange={(_, v) => {
            setInputType(v);
            setInput('');
            setOutput('');
            setImagePreview('');
            setFileName('');
          }}
          sx={{
            minHeight: 48,
            '& .MuiTab-root': { minHeight: 48, color: 'grey.500' },
          }}
        >
          <Tab icon={<TextFields sx={{ fontSize: 18 }} />} iconPosition="start" label="Text" value="text" />
          <Tab icon={<InsertDriveFile sx={{ fontSize: 18 }} />} iconPosition="start" label="File" value="file" />
          <Tab icon={<ImageIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Image" value="image" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 180px)' }}>
          {/* Input Panel */}
          <Paper sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                {mode === 'encode' ? 'Input (Plain)' : 'Input (Base64)'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {inputType !== 'text' && (
                  <Button
                    component="label"
                    size="small"
                    startIcon={<Upload />}
                    sx={{ color: 'grey.400' }}
                  >
                    Upload
                    <input
                      type="file"
                      hidden
                      accept={inputType === 'image' ? 'image/*' : '*/*'}
                      onChange={handleFileUpload}
                    />
                  </Button>
                )}
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => handleCopy(input)} sx={{ color: 'grey.500' }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 2 }}>
              {inputType === 'text' ? (
                <TextField
                  multiline
                  fullWidth
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                  sx={{
                    height: '100%',
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
              ) : inputType === 'image' && imagePreview ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                  />
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>
                    {fileName}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography sx={{ color: 'grey.600' }}>
                    {inputType === 'image' ? 'Upload an image to encode' : 'Upload a file to encode'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Swap Button */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Swap input/output">
              <IconButton
                onClick={handleSwap}
                sx={{
                  bgcolor: '#222',
                  color: 'grey.400',
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                <SwapVert />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Output Panel */}
          <Paper sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                {mode === 'encode' ? 'Output (Base64)' : 'Output (Plain)'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => handleCopy(output)} sx={{ color: 'grey.500' }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton size="small" onClick={handleDownload} sx={{ color: 'grey.500' }}>
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
                {mode === 'decode' && inputType !== 'text' && (
                  <Button size="small" onClick={handleDecodeToFile} sx={{ color: 'grey.400' }}>
                    Save as File
                  </Button>
                )}
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              {mode === 'decode' && inputType === 'image' && output ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <img
                    src={getDataUrl()}
                    alt="Decoded"
                    style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                    onError={() => setSnackbar({ open: true, message: 'Invalid image data' })}
                  />
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: 14,
                    color: '#d4d4d4',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {output || 'Output will appear here...'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Stats */}
        {inputType === 'text' && (
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'grey.600' }}>Input Length</Typography>
                <Typography sx={{ color: 'grey.300', fontFamily: 'monospace' }}>{input.length} characters</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'grey.600' }}>Output Length</Typography>
                <Typography sx={{ color: 'grey.300', fontFamily: 'monospace' }}>{output.length} characters</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'grey.600' }}>Size Change</Typography>
                <Typography sx={{ color: mode === 'encode' ? '#e06c75' : '#98c379', fontFamily: 'monospace' }}>
                  {mode === 'encode'
                    ? `+${Math.round((output.length / input.length - 1) * 100)}%`
                    : `-${Math.round((1 - output.length / input.length) * 100)}%`
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
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
