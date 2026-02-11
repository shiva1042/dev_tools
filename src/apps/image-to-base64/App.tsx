import { useState, useRef, useCallback } from 'react';
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
  Tabs,
  Tab,
} from '@mui/material';
import { ContentCopy, Home, Upload, Image as ImageIcon, Warning } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface ImageInfo {
  dataUri: string;
  rawBase64: string;
  mimeType: string;
  fileName: string;
  originalSize: number;
  width: number;
  height: number;
}

export default function ImageToBase64() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [tab, setTab] = useState(0);
  const [decodeInput, setDecodeInput] = useState('');
  const [decodedImage, setDecodedImage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|gif|svg\+xml|webp|x-icon|vnd\.microsoft\.icon)$/)) {
      setSnackbar({ open: true, message: 'Unsupported file format. Use PNG, JPG, GIF, SVG, WebP, or ICO.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      const rawBase64 = dataUri.split(',')[1];

      const img = new Image();
      img.onload = () => {
        setImageInfo({
          dataUri,
          rawBase64,
          mimeType: file.type,
          fileName: file.name,
          originalSize: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => {
        setImageInfo({
          dataUri,
          rawBase64,
          mimeType: file.type,
          fileName: file.name,
          originalSize: file.size,
          width: 0,
          height: 0,
        });
      };
      img.src = dataUri;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDecode = () => {
    let input = decodeInput.trim();
    if (input.startsWith('data:')) {
      setDecodedImage(input);
    } else {
      const guessType = input.charAt(0) === '/' ? 'image/jpeg' : input.startsWith('iVBOR') ? 'image/png' : input.startsWith('R0lGOD') ? 'image/gif' : input.startsWith('PHN2Zy') ? 'image/svg+xml' : 'image/png';
      setDecodedImage(`data:${guessType};base64,${input}`);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard` });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const b64Size = imageInfo ? Math.ceil(imageInfo.rawBase64.length * 0.75) : 0;
  const b64StringSize = imageInfo ? imageInfo.rawBase64.length : 0;
  const isLarge = b64StringSize > 100 * 1024;

  const OutputRow = ({ label, value }: { label: string; value: string }) => (
    <Paper sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', p: 1.5, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>{label}</Typography>
        <Tooltip title="Copy">
          <IconButton size="small" onClick={() => handleCopy(value, label)} sx={{ color: 'grey.500' }}>
            <ContentCopy sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography sx={{
        fontFamily: 'monospace', fontSize: 11, color: '#98c379', wordBreak: 'break-all',
        maxHeight: 60, overflow: 'auto', display: 'block',
      }}>
        {value.length > 500 ? value.slice(0, 500) + '...' : value}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Image to Base64 Converter</Typography>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222', px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, color: 'grey.500' } }}>
          <Tab label="Encode Image" />
          <Tab label="Decode Base64" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 3 }}>
        {tab === 0 ? (
          <Box sx={{ display: 'flex', gap: 3, minHeight: 'calc(100vh - 180px)' }}>
            {/* Upload area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  bgcolor: dragOver ? '#1a1a2e' : '#111', border: dragOver ? '2px dashed #61afef' : '2px dashed #333',
                  p: 4, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { borderColor: '#555' },
                }}>
                <ImageIcon sx={{ fontSize: 48, color: 'grey.600', mb: 1 }} />
                <Typography sx={{ color: 'grey.400' }}>Drop an image here or click to browse</Typography>
                <Typography variant="caption" sx={{ color: 'grey.600' }}>PNG, JPG, GIF, SVG, WebP, ICO</Typography>
                <input ref={fileInputRef} type="file" hidden accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp,image/x-icon" onChange={handleFileChange} />
              </Paper>

              {imageInfo && (
                <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ flexShrink: 0 }}>
                      <img src={imageInfo.dataUri} alt="Preview" style={{ maxWidth: 160, maxHeight: 160, objectFit: 'contain', borderRadius: 4, border: '1px solid #333' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: 'grey.300', mb: 1 }}>{imageInfo.fileName}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip size="small" label={`${imageInfo.width} x ${imageInfo.height}`} sx={{ bgcolor: '#1a1a2e', color: '#61afef' }} />
                        <Chip size="small" label={imageInfo.mimeType} sx={{ bgcolor: '#1a2e1a', color: '#98c379' }} />
                        <Chip size="small" label={`Original: ${formatSize(imageInfo.originalSize)}`} sx={{ bgcolor: '#222', color: 'grey.400' }} />
                        <Chip size="small" label={`Base64: ${formatSize(b64StringSize)}`} sx={{ bgcolor: '#222', color: 'grey.400' }} />
                        <Chip size="small"
                          label={`Size change: +${Math.round(((b64StringSize - imageInfo.originalSize) / imageInfo.originalSize) * 100)}%`}
                          sx={{ bgcolor: '#2e1a1a', color: '#e06c75' }} />
                      </Box>
                      {isLarge && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <Warning sx={{ fontSize: 16, color: '#e5c07b' }} />
                          <Typography variant="caption" sx={{ color: '#e5c07b' }}>Large file! Base64 is over 100KB. Consider using a URL instead.</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* Output formats */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {imageInfo ? (
                <>
                  <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Output Formats</Typography>
                  <OutputRow label="Data URI" value={imageInfo.dataUri} />
                  <OutputRow label="Raw Base64" value={imageInfo.rawBase64} />
                  <OutputRow label="HTML <img> tag" value={`<img src="${imageInfo.dataUri}" alt="${imageInfo.fileName}" width="${imageInfo.width}" height="${imageInfo.height}" />`} />
                  <OutputRow label="CSS background-image" value={`background-image: url('${imageInfo.dataUri}');`} />
                  <OutputRow label="Markdown" value={`![${imageInfo.fileName}](${imageInfo.dataUri})`} />
                </>
              ) : (
                <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 4, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: 'grey.600' }}>Upload an image to see output formats</Typography>
                </Paper>
              )}
            </Box>
          </Box>
        ) : (
          /* Decode tab */
          <Box sx={{ display: 'flex', gap: 3, minHeight: 'calc(100vh - 180px)' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Paste Base64 or Data URI</Typography>
              <TextField
                multiline fullWidth value={decodeInput} onChange={(e) => setDecodeInput(e.target.value)}
                placeholder="data:image/png;base64,iVBOR... or just the raw base64 string"
                rows={10}
                sx={{
                  mb: 2,
                  '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 12, bgcolor: '#0a0a0a', color: '#d4d4d4' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                }} />
              <Button variant="contained" onClick={handleDecode} sx={{ bgcolor: '#1a3a5c', '&:hover': { bgcolor: '#254a70' } }}>
                Decode & Preview
              </Button>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {decodedImage ? (
                <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, width: '100%' }}>
                  <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Decoded Image Preview</Typography>
                  <Box sx={{ textAlign: 'center' }}>
                    <img src={decodedImage} alt="Decoded" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 4 }}
                      onError={() => setSnackbar({ open: true, message: 'Failed to decode - invalid base64 or image data' })} />
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 4, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <Typography sx={{ color: 'grey.600' }}>Paste base64 and click Decode to preview</Typography>
                </Paper>
              )}
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
