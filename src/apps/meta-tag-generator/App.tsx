import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Snackbar, Chip,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab,
} from '@mui/material';
import { Home, ContentCopy, Visibility } from '@mui/icons-material';

const tfSx = {
  '& .MuiInputBase-root': { bgcolor: '#0a0a0a', color: 'grey.300', fontFamily: 'monospace', fontSize: 13 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
};

export default function App() {
  const [title, setTitle] = useState('My Awesome Website');
  const [description, setDescription] = useState('A modern website built with the latest technologies. Discover amazing features and content.');
  const [keywords, setKeywords] = useState('web, development, tools, technology');
  const [author, setAuthor] = useState('John Doe');
  const [robots, setRobots] = useState('index, follow');
  const [canonical, setCanonical] = useState('https://example.com');
  const [viewport, setViewport] = useState('width=device-width, initial-scale=1.0');
  const [charset, setCharset] = useState('UTF-8');
  const [language, setLanguage] = useState('en');
  const [themeColor, setThemeColor] = useState('#1976d2');
  const [favicon, setFavicon] = useState('/favicon.ico');

  // Open Graph
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('https://example.com/og-image.jpg');
  const [ogUrl, setOgUrl] = useState('https://example.com');
  const [ogType, setOgType] = useState('website');
  const [ogSiteName, setOgSiteName] = useState('My Website');
  const [ogLocale, setOgLocale] = useState('en_US');

  // Twitter
  const [twCard, setTwCard] = useState('summary_large_image');
  const [twTitle, setTwTitle] = useState('');
  const [twDescription, setTwDescription] = useState('');
  const [twImage, setTwImage] = useState('');
  const [twSite, setTwSite] = useState('@mysite');
  const [twCreator, setTwCreator] = useState('@creator');

  const [activeTab, setActiveTab] = useState(0);
  const [previewTab, setPreviewTab] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);

  const metaTags = useMemo(() => {
    const tags: string[] = [];
    tags.push(`<meta charset="${charset}">`);
    tags.push(`<meta name="viewport" content="${viewport}">`);
    if (title) tags.push(`<title>${title}</title>`);
    if (description) tags.push(`<meta name="description" content="${description}">`);
    if (keywords) tags.push(`<meta name="keywords" content="${keywords}">`);
    if (author) tags.push(`<meta name="author" content="${author}">`);
    if (robots) tags.push(`<meta name="robots" content="${robots}">`);
    if (themeColor) tags.push(`<meta name="theme-color" content="${themeColor}">`);
    if (language) tags.push(`<meta http-equiv="content-language" content="${language}">`);
    if (canonical) tags.push(`<link rel="canonical" href="${canonical}">`);
    if (favicon) tags.push(`<link rel="icon" href="${favicon}">`);
    tags.push('');
    tags.push('<!-- Open Graph / Facebook -->');
    tags.push(`<meta property="og:type" content="${ogType}">`);
    tags.push(`<meta property="og:title" content="${ogTitle || title}">`);
    tags.push(`<meta property="og:description" content="${ogDescription || description}">`);
    if (ogImage) tags.push(`<meta property="og:image" content="${ogImage}">`);
    if (ogUrl) tags.push(`<meta property="og:url" content="${ogUrl}">`);
    if (ogSiteName) tags.push(`<meta property="og:site_name" content="${ogSiteName}">`);
    if (ogLocale) tags.push(`<meta property="og:locale" content="${ogLocale}">`);
    tags.push('');
    tags.push('<!-- Twitter -->');
    tags.push(`<meta name="twitter:card" content="${twCard}">`);
    tags.push(`<meta name="twitter:title" content="${twTitle || ogTitle || title}">`);
    tags.push(`<meta name="twitter:description" content="${twDescription || ogDescription || description}">`);
    if (twImage || ogImage) tags.push(`<meta name="twitter:image" content="${twImage || ogImage}">`);
    if (twSite) tags.push(`<meta name="twitter:site" content="${twSite}">`);
    if (twCreator) tags.push(`<meta name="twitter:creator" content="${twCreator}">`);
    return tags.join('\n');
  }, [title, description, keywords, author, robots, canonical, viewport, charset, language, themeColor, favicon, ogTitle, ogDescription, ogImage, ogUrl, ogType, ogSiteName, ogLocale, twCard, twTitle, twDescription, twImage, twSite, twCreator]);

  const copy = () => { navigator.clipboard.writeText(metaTags); setSnackOpen(true); };

  const displayTitle = ogTitle || title;
  const displayDesc = ogDescription || description;
  const displayUrl = ogUrl || canonical;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Meta Tag Generator</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
            sx={{ mb: 2, '& .MuiTab-root': { color: 'grey.500', textTransform: 'none' }, '& .Mui-selected': { color: '#42a5f5' } }}>
            <Tab label="Basic SEO" />
            <Tab label="Open Graph" />
            <Tab label="Twitter Card" />
            <Tab label="Additional" />
          </Tabs>

          {activeTab === 0 && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Basic SEO</Typography>
              <TextField size="small" fullWidth label="Title" value={title} onChange={e => setTitle(e.target.value)} sx={{ ...tfSx, mb: 1.5 }}
                helperText={<Typography component="span" sx={{ color: title.length > 60 ? '#ef5350' : 'grey.500', fontSize: 11 }}>{title.length}/60 characters</Typography>} />
              <TextField size="small" fullWidth multiline rows={2} label="Description" value={description} onChange={e => setDescription(e.target.value)} sx={{ ...tfSx, mb: 1.5 }}
                helperText={<Typography component="span" sx={{ color: description.length > 160 ? '#ef5350' : 'grey.500', fontSize: 11 }}>{description.length}/160 characters</Typography>} />
              <TextField size="small" fullWidth label="Keywords" value={keywords} onChange={e => setKeywords(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <TextField size="small" fullWidth label="Author" value={author} onChange={e => setAuthor(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Robots</InputLabel>
                <Select value={robots} label="Robots" onChange={e => setRobots(e.target.value)}
                  sx={{ bgcolor: '#0a0a0a', color: 'grey.300', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                  <MenuItem value="index, follow">index, follow</MenuItem>
                  <MenuItem value="noindex, follow">noindex, follow</MenuItem>
                  <MenuItem value="index, nofollow">index, nofollow</MenuItem>
                  <MenuItem value="noindex, nofollow">noindex, nofollow</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Open Graph</Typography>
              <TextField size="small" fullWidth label="og:title (defaults to title)" value={ogTitle} onChange={e => setOgTitle(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <TextField size="small" fullWidth multiline rows={2} label="og:description" value={ogDescription} onChange={e => setOgDescription(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <TextField size="small" fullWidth label="og:image" value={ogImage} onChange={e => setOgImage(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <TextField size="small" fullWidth label="og:url" value={ogUrl} onChange={e => setOgUrl(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>og:type</InputLabel>
                  <Select value={ogType} label="og:type" onChange={e => setOgType(e.target.value)}
                    sx={{ bgcolor: '#0a0a0a', color: 'grey.300', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {['website', 'article', 'product', 'profile', 'video', 'music'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" label="og:site_name" value={ogSiteName} onChange={e => setOgSiteName(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
                <TextField size="small" label="og:locale" value={ogLocale} onChange={e => setOgLocale(e.target.value)} sx={{ ...tfSx, width: 120 }} />
              </Box>
            </Paper>
          )}

          {activeTab === 2 && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Twitter Card</Typography>
              <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
                <InputLabel sx={{ color: 'grey.500' }}>twitter:card</InputLabel>
                <Select value={twCard} label="twitter:card" onChange={e => setTwCard(e.target.value)}
                  sx={{ bgcolor: '#0a0a0a', color: 'grey.300', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                  <MenuItem value="summary">summary</MenuItem>
                  <MenuItem value="summary_large_image">summary_large_image</MenuItem>
                </Select>
              </FormControl>
              <TextField size="small" fullWidth label="twitter:title (defaults to og:title)" value={twTitle} onChange={e => setTwTitle(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <TextField size="small" fullWidth label="twitter:description" value={twDescription} onChange={e => setTwDescription(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <TextField size="small" fullWidth label="twitter:image (defaults to og:image)" value={twImage} onChange={e => setTwImage(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" label="twitter:site" value={twSite} onChange={e => setTwSite(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
                <TextField size="small" label="twitter:creator" value={twCreator} onChange={e => setTwCreator(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
              </Box>
            </Paper>
          )}

          {activeTab === 3 && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Additional</Typography>
              <TextField size="small" fullWidth label="Canonical URL" value={canonical} onChange={e => setCanonical(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <TextField size="small" fullWidth label="Viewport" value={viewport} onChange={e => setViewport(e.target.value)} sx={{ ...tfSx, mb: 1.5 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField size="small" label="Charset" value={charset} onChange={e => setCharset(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
                <TextField size="small" label="Language" value={language} onChange={e => setLanguage(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" label="Theme Color" value={themeColor} onChange={e => setThemeColor(e.target.value)} sx={{ ...tfSx, flex: 1 }}
                  InputProps={{ startAdornment: <Box sx={{ width: 20, height: 20, bgcolor: themeColor, borderRadius: 0.5, mr: 1, border: '1px solid #333' }} /> }} />
                <TextField size="small" label="Favicon URL" value={favicon} onChange={e => setFavicon(e.target.value)} sx={{ ...tfSx, flex: 1 }} />
              </Box>
            </Paper>
          )}
        </Box>

        {/* Right Panel: Preview + Output */}
        <Box sx={{ width: 480 }}>
          {/* Previews */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2, borderRadius: 2 }}>
            <Tabs value={previewTab} onChange={(_, v) => setPreviewTab(v)}
              sx={{ mb: 2, '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', fontSize: 12 }, '& .Mui-selected': { color: '#42a5f5' } }}>
              <Tab label="Google" icon={<Visibility sx={{ fontSize: 14 }} />} iconPosition="start" />
              <Tab label="Facebook" />
              <Tab label="Twitter" />
            </Tabs>

            {previewTab === 0 && (
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                <Typography sx={{ color: '#1a0dab', fontSize: 18, fontFamily: 'arial', cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, lineHeight: 1.3 }}>
                  {title || 'Page Title'}
                </Typography>
                <Typography sx={{ color: '#006621', fontSize: 13, fontFamily: 'arial' }}>
                  {displayUrl || 'https://example.com'}
                </Typography>
                <Typography sx={{ color: '#545454', fontSize: 13, fontFamily: 'arial', mt: 0.5 }}>
                  {description ? description.substring(0, 160) : 'Meta description will appear here...'}
                </Typography>
              </Box>
            )}

            {previewTab === 1 && (
              <Box sx={{ bgcolor: '#f0f2f5', borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
                <Box sx={{ height: 150, bgcolor: '#e4e6e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#888', fontSize: 12 }}>og:image preview</Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: '#f0f2f5' }}>
                  <Typography sx={{ color: '#606770', fontSize: 11, textTransform: 'uppercase' }}>{new URL(displayUrl || 'https://example.com').hostname}</Typography>
                  <Typography sx={{ color: '#1d2129', fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{displayTitle || 'Page Title'}</Typography>
                  <Typography sx={{ color: '#606770', fontSize: 13, mt: 0.3 }}>{displayDesc?.substring(0, 100) || 'Description...'}</Typography>
                </Box>
              </Box>
            )}

            {previewTab === 2 && (
              <Box sx={{ bgcolor: '#15202b', borderRadius: 2, overflow: 'hidden', border: '1px solid #38444d' }}>
                {twCard === 'summary_large_image' && (
                  <Box sx={{ height: 140, bgcolor: '#192734', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#8899a6', fontSize: 12 }}>twitter:image preview</Typography>
                  </Box>
                )}
                <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
                  {twCard === 'summary' && (
                    <Box sx={{ width: 80, height: 80, bgcolor: '#192734', borderRadius: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ color: '#8899a6', fontSize: 10 }}>img</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography sx={{ color: '#8899a6', fontSize: 11 }}>{new URL(displayUrl || 'https://example.com').hostname}</Typography>
                    <Typography sx={{ color: '#ffffff', fontSize: 14, fontWeight: 600 }}>{twTitle || displayTitle || 'Title'}</Typography>
                    <Typography sx={{ color: '#8899a6', fontSize: 13 }}>{(twDescription || displayDesc || 'Description').substring(0, 100)}</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Generated Tags */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Generated Meta Tags</Typography>
              <Tooltip title="Copy all"><IconButton size="small" onClick={copy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
            </Box>
            <Box sx={{ bgcolor: '#0a0a0a', border: '1px solid #222', borderRadius: 1, p: 2, maxHeight: 400, overflow: 'auto' }}>
              <Typography component="pre" sx={{ color: '#98c379', fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', m: 0 }}>
                {metaTags}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
