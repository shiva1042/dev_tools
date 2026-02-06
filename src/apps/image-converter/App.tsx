import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Home,
  Upload,
  Download,
  Refresh,
  Delete,
  Image as ImageIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type OutputFormat = 'png' | 'jpeg' | 'webp';

interface ImageData {
  id: string;
  name: string;
  originalFile: File;
  originalUrl: string;
  originalSize: number;
  width: number;
  height: number;
  convertedUrl?: string;
  convertedSize?: number;
}

export default function ImageConverter() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [quality, setQuality] = useState<number>(90);
  const [resizeWidth, setResizeWidth] = useState<string>('');
  const [resizeHeight, setResizeHeight] = useState<string>('');
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selected = images.find(img => img.id === selectedId);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newImage: ImageData = {
            id: String(Date.now()) + Math.random(),
            name: file.name,
            originalFile: file,
            originalUrl: url,
            originalSize: file.size,
            width: img.width,
            height: img.height,
          };
          setImages(prev => [...prev, newImage]);
          if (!selectedId) setSelectedId(newImage.id);
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }, [selectedId]);

  const handleConvert = useCallback(() => {
    if (!selected || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      let newWidth = resizeWidth ? parseInt(resizeWidth) : img.width;
      let newHeight = resizeHeight ? parseInt(resizeHeight) : img.height;

      if (maintainAspect) {
        if (resizeWidth && !resizeHeight) {
          newHeight = Math.round((newWidth / img.width) * img.height);
        } else if (resizeHeight && !resizeWidth) {
          newWidth = Math.round((newHeight / img.height) * img.width);
        }
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const mimeType = `image/${outputFormat}`;
      const qualityValue = outputFormat === 'png' ? undefined : quality / 100;
      const dataUrl = canvas.toDataURL(mimeType, qualityValue);

      // Calculate converted size
      const base64Length = dataUrl.split(',')[1].length;
      const convertedSize = Math.round((base64Length * 3) / 4);

      setImages(prev => prev.map(i =>
        i.id === selected.id
          ? { ...i, convertedUrl: dataUrl, convertedSize, width: newWidth, height: newHeight }
          : i
      ));

      setSnackbar({ open: true, message: 'Image converted successfully' });
    };
    img.src = selected.originalUrl;
  }, [selected, outputFormat, quality, resizeWidth, resizeHeight, maintainAspect]);

  const handleDownload = useCallback(() => {
    if (!selected?.convertedUrl) return;

    const link = document.createElement('a');
    const baseName = selected.name.replace(/\.[^.]+$/, '');
    link.download = `${baseName}.${outputFormat}`;
    link.href = selected.convertedUrl;
    link.click();
  }, [selected, outputFormat]);

  const handleDownloadAll = useCallback(() => {
    images.forEach(img => {
      if (img.convertedUrl) {
        const link = document.createElement('a');
        const baseName = img.name.replace(/\.[^.]+$/, '');
        link.download = `${baseName}.${outputFormat}`;
        link.href = img.convertedUrl;
        link.click();
      }
    });
  }, [images, outputFormat]);

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
    if (selectedId === id) {
      setSelectedId(images.find(i => i.id !== id)?.id || null);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Image Converter</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component="label" startIcon={<Upload />} sx={{ color: 'grey.400' }}>
              Upload
              <input type="file" hidden accept="image/*" multiple onChange={handleFileUpload} />
            </Button>
            {images.length > 0 && (
              <Button startIcon={<Download />} onClick={handleDownloadAll} disabled={!images.some(i => i.convertedUrl)} sx={{ color: 'grey.400' }}>
                Download All
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Image List */}
        <Box sx={{ width: 250, borderRight: '1px solid #222', overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', p: 2, borderBottom: '1px solid #222' }}>
            Images ({images.length})
          </Typography>
          {images.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ImageIcon sx={{ fontSize: 48, color: 'grey.700', mb: 2 }} />
              <Typography sx={{ color: 'grey.600' }}>Upload images to get started</Typography>
            </Box>
          ) : (
            images.map(img => (
              <Box
                key={img.id}
                onClick={() => setSelectedId(img.id)}
                sx={{
                  p: 2,
                  borderBottom: '1px solid #222',
                  cursor: 'pointer',
                  bgcolor: selectedId === img.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  '&:hover': { bgcolor: selectedId === img.id ? 'rgba(59, 130, 246, 0.1)' : 'action.hover' },
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <img
                    src={img.convertedUrl || img.originalUrl}
                    alt={img.name}
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: 'grey.300', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {img.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'grey.600' }}>
                      {img.width} × {img.height}
                    </Typography>
                    {img.convertedUrl && (
                      <Chip label="Converted" size="small" sx={{ height: 16, fontSize: 10, mt: 0.5 }} color="success" />
                    )}
                  </Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }} sx={{ color: 'grey.500' }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Preview & Settings */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selected ? (
            <>
              {/* Preview */}
              <Box sx={{ flex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0d0d0d' }}>
                <img
                  src={selected.convertedUrl || selected.originalUrl}
                  alt={selected.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>

              {/* Info Bar */}
              <Paper sx={{ bgcolor: '#111', borderTop: '1px solid #222', px: 3, py: 1.5, display: 'flex', gap: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Original</Typography>
                  <Typography sx={{ color: 'grey.400', fontSize: 13 }}>{formatSize(selected.originalSize)}</Typography>
                </Box>
                {selected.convertedSize && (
                  <>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'grey.600' }}>Converted</Typography>
                      <Typography sx={{ color: 'grey.400', fontSize: 13 }}>{formatSize(selected.convertedSize)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'grey.600' }}>Reduction</Typography>
                      <Typography sx={{ color: selected.convertedSize < selected.originalSize ? '#10b981' : '#ef4444', fontSize: 13 }}>
                        {Math.round((1 - selected.convertedSize / selected.originalSize) * 100)}%
                      </Typography>
                    </Box>
                  </>
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: 'grey.600' }}>Dimensions</Typography>
                  <Typography sx={{ color: 'grey.400', fontSize: 13 }}>{selected.width} × {selected.height}</Typography>
                </Box>
              </Paper>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: 'grey.600' }}>Select an image to preview</Typography>
            </Box>
          )}
        </Box>

        {/* Settings Panel */}
        <Box sx={{ width: 300, borderLeft: '1px solid #222', p: 2, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Conversion Settings</Typography>

          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel sx={{ color: 'grey.500' }}>Output Format</InputLabel>
            <Select value={outputFormat} label="Output Format" onChange={(e) => setOutputFormat(e.target.value as OutputFormat)} sx={{ color: 'grey.300' }}>
              <MenuItem value="png">PNG</MenuItem>
              <MenuItem value="jpeg">JPEG</MenuItem>
              <MenuItem value="webp">WebP</MenuItem>
            </Select>
          </FormControl>

          {outputFormat !== 'png' && (
            <>
              <Typography variant="caption" sx={{ color: 'grey.600' }}>Quality: {quality}%</Typography>
              <Slider value={quality} onChange={(_, v) => setQuality(v as number)} min={10} max={100} sx={{ mb: 3 }} />
            </>
          )}

          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Resize</Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              label="Width"
              value={resizeWidth}
              onChange={(e) => setResizeWidth(e.target.value.replace(/\D/g, ''))}
              placeholder={selected ? String(selected.width) : ''}
              sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
            />
            <TextField
              size="small"
              label="Height"
              value={resizeHeight}
              onChange={(e) => setResizeHeight(e.target.value.replace(/\D/g, ''))}
              placeholder={selected ? String(selected.height) : ''}
              sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {[
              { label: '50%', action: () => { if (selected) { setResizeWidth(String(Math.round(selected.width * 0.5))); setResizeHeight(''); } } },
              { label: '75%', action: () => { if (selected) { setResizeWidth(String(Math.round(selected.width * 0.75))); setResizeHeight(''); } } },
              { label: 'Original', action: () => { setResizeWidth(''); setResizeHeight(''); } },
            ].map(preset => (
              <Chip key={preset.label} label={preset.label} size="small" onClick={preset.action} sx={{ cursor: 'pointer' }} />
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleConvert}
            disabled={!selected}
            sx={{ bgcolor: '#2563eb', mb: 2 }}
          >
            Convert
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
            disabled={!selected?.convertedUrl}
            sx={{ borderColor: '#333', color: 'grey.400' }}
          >
            Download
          </Button>
        </Box>
      </Box>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
