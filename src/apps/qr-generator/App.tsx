import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import WifiIcon from '@mui/icons-material/Wifi';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import EmailIcon from '@mui/icons-material/Email';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ padding: '16px 0' }}>
      {value === index && children}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [copied, setCopied] = useState(false);

  // URL tab
  const [url, setUrl] = useState('https://example.com');

  // Text tab
  const [text, setText] = useState('Hello World!');

  // WiFi tab
  const [wifiSsid, setWifiSsid] = useState('MyNetwork');
  const [wifiPassword, setWifiPassword] = useState('password123');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // Contact tab
  const [contactName, setContactName] = useState('John Doe');
  const [contactPhone, setContactPhone] = useState('+1234567890');
  const [contactEmail, setContactEmail] = useState('john@example.com');
  const [contactOrg, setContactOrg] = useState('Company Inc.');

  // Email tab
  const [emailTo, setEmailTo] = useState('recipient@example.com');
  const [emailSubject, setEmailSubject] = useState('Hello');
  const [emailBody, setEmailBody] = useState('This is a test email.');

  const getQRContent = (): string => {
    switch (tab) {
      case 0:
        return url;
      case 1:
        return text;
      case 2:
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
      case 3:
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nORG:${contactOrg}\nEND:VCARD`;
      case 4:
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      default:
        return '';
    }
  };

  // Generate QR code using goqr.me API
  const qrImageUrl = useMemo(() => {
    const content = getQRContent();
    if (!content) return '';
    const encodedData = encodeURIComponent(content);
    const fg = fgColor.replace('#', '');
    const bg = bgColor.replace('#', '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&color=${fg}&bgcolor=${bg}`;
  }, [tab, url, text, wifiSsid, wifiPassword, wifiEncryption, contactName, contactPhone, contactEmail, contactOrg, emailTo, emailSubject, emailBody, size, fgColor, bgColor]);

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = downloadUrl;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: copy URL
      await navigator.clipboard.writeText(qrImageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon />
            </IconButton>
            <QrCodeIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              QR Code Generator
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Left Panel - Input */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
                  <Tab icon={<LinkIcon />} label="URL" iconPosition="start" />
                  <Tab icon={<TextFieldsIcon />} label="Text" iconPosition="start" />
                  <Tab icon={<WifiIcon />} label="WiFi" iconPosition="start" />
                  <Tab icon={<ContactPhoneIcon />} label="Contact" iconPosition="start" />
                  <Tab icon={<EmailIcon />} label="Email" iconPosition="start" />
                </Tabs>

                <TabPanel value={tab} index={0}>
                  <TextField
                    fullWidth
                    label="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </TabPanel>

                <TabPanel value={tab} index={1}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Text Content"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </TabPanel>

                <TabPanel value={tab} index={2}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Network Name (SSID)"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Encryption</InputLabel>
                      <Select
                        value={wifiEncryption}
                        label="Encryption"
                        onChange={(e) => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                      >
                        <MenuItem value="WPA">WPA/WPA2</MenuItem>
                        <MenuItem value="WEP">WEP</MenuItem>
                        <MenuItem value="nopass">None</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </TabPanel>

                <TabPanel value={tab} index={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Organization"
                      value={contactOrg}
                      onChange={(e) => setContactOrg(e.target.value)}
                    />
                  </Box>
                </TabPanel>

                <TabPanel value={tab} index={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="To Email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    />
                  </Box>
                </TabPanel>

                <Divider sx={{ my: 2 }} />

                {/* Style Options */}
                <Typography variant="subtitle2" gutterBottom>
                  Style Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" gutterBottom>
                      Size: {size}px
                    </Typography>
                    <Slider
                      value={size}
                      onChange={(_, v) => setSize(v as number)}
                      min={128}
                      max={512}
                      step={32}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" gutterBottom>
                      Foreground Color
                    </Typography>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      style={{ width: '100%', height: 40, cursor: 'pointer' }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" gutterBottom>
                      Background Color
                    </Typography>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ width: '100%', height: 40, cursor: 'pointer' }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Right Panel - Preview */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    mb: 2,
                    bgcolor: '#ffffff',
                    borderRadius: 2,
                  }}
                >
                  {qrImageUrl && (
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      style={{ maxWidth: '100%', height: 'auto' }}
                      crossOrigin="anonymous"
                    />
                  )}
                </Box>

                {copied && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    QR Code copied to clipboard!
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
                    Download PNG
                  </Button>
                  <Tooltip title="Copy to Clipboard">
                    <IconButton onClick={handleCopy} color="primary">
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  QR Code generated using goqr.me API
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
