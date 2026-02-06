import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import DrawIcon from '@mui/icons-material/Draw';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ec4899' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  twitter: string;
  github: string;
  imageUrl: string;
  primaryColor: string;
  template: 'modern' | 'classic' | 'minimal' | 'bold';
  showImage: boolean;
  showSocial: boolean;
  showDivider: boolean;
}

export default function App() {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<SignatureData>({
    fullName: 'John Doe',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Company Inc.',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    website: 'www.company.com',
    linkedin: 'johndoe',
    twitter: 'johndoe',
    github: 'johndoe',
    imageUrl: '',
    primaryColor: '#3b82f6',
    template: 'modern',
    showImage: true,
    showSocial: true,
    showDivider: true,
  });

  const generateHTML = (): string => {
    const socialLinks = [];
    if (data.linkedin) {
      socialLinks.push(`<a href="https://linkedin.com/in/${data.linkedin}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">LinkedIn</a>`);
    }
    if (data.twitter) {
      socialLinks.push(`<a href="https://twitter.com/${data.twitter}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">Twitter</a>`);
    }
    if (data.github) {
      socialLinks.push(`<a href="https://github.com/${data.github}" style="color:${data.primaryColor};text-decoration:none;margin-right:8px;">GitHub</a>`);
    }

    const templates = {
      modern: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333;">
  <tr>
    ${data.showImage && data.imageUrl ? `<td style="vertical-align:top;padding-right:15px;"><img src="${data.imageUrl}" width="80" height="80" style="border-radius:50%;" alt=""></td>` : ''}
    <td style="vertical-align:top;">
      <p style="margin:0;font-size:18px;font-weight:bold;color:${data.primaryColor};">${data.fullName}</p>
      <p style="margin:4px 0;color:#666;">${data.jobTitle} | ${data.company}</p>
      ${data.showDivider ? `<div style="width:50px;height:3px;background:${data.primaryColor};margin:10px 0;"></div>` : ''}
      <p style="margin:4px 0;"><a href="mailto:${data.email}" style="color:#333;text-decoration:none;">${data.email}</a></p>
      ${data.phone ? `<p style="margin:4px 0;">${data.phone}</p>` : ''}
      ${data.website ? `<p style="margin:4px 0;"><a href="https://${data.website}" style="color:${data.primaryColor};text-decoration:none;">${data.website}</a></p>` : ''}
      ${data.showSocial && socialLinks.length > 0 ? `<p style="margin:10px 0 0;">${socialLinks.join('')}</p>` : ''}
    </td>
  </tr>
</table>`,
      classic: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Georgia,serif;font-size:14px;color:#333;">
  <tr>
    <td style="vertical-align:top;">
      <p style="margin:0;font-size:16px;font-weight:bold;">${data.fullName}</p>
      <p style="margin:2px 0;font-style:italic;color:#666;">${data.jobTitle}</p>
      <p style="margin:2px 0;">${data.company}</p>
      <hr style="border:none;border-top:1px solid #ccc;margin:10px 0;">
      <p style="margin:4px 0;font-size:12px;">Email: <a href="mailto:${data.email}" style="color:${data.primaryColor};">${data.email}</a></p>
      ${data.phone ? `<p style="margin:4px 0;font-size:12px;">Phone: ${data.phone}</p>` : ''}
      ${data.website ? `<p style="margin:4px 0;font-size:12px;">Web: <a href="https://${data.website}" style="color:${data.primaryColor};">${data.website}</a></p>` : ''}
    </td>
  </tr>
</table>`,
      minimal: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#555;">
  <tr>
    <td>
      <p style="margin:0;"><strong>${data.fullName}</strong> | ${data.jobTitle} | ${data.company}</p>
      <p style="margin:4px 0;font-size:12px;">
        <a href="mailto:${data.email}" style="color:${data.primaryColor};text-decoration:none;">${data.email}</a>
        ${data.phone ? ` · ${data.phone}` : ''}
        ${data.website ? ` · <a href="https://${data.website}" style="color:${data.primaryColor};text-decoration:none;">${data.website}</a>` : ''}
      </p>
    </td>
  </tr>
</table>`,
      bold: `
<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;">
  <tr>
    <td style="background:${data.primaryColor};padding:15px;border-radius:8px;">
      <p style="margin:0;font-size:20px;font-weight:bold;color:#fff;">${data.fullName}</p>
      <p style="margin:4px 0;color:rgba(255,255,255,0.9);">${data.jobTitle}</p>
      <p style="margin:4px 0;color:rgba(255,255,255,0.8);font-size:12px;">${data.company}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:15px 0;">
      <p style="margin:4px 0;"><a href="mailto:${data.email}" style="color:#333;text-decoration:none;">${data.email}</a></p>
      ${data.phone ? `<p style="margin:4px 0;color:#666;">${data.phone}</p>` : ''}
      ${data.website ? `<p style="margin:4px 0;"><a href="https://${data.website}" style="color:${data.primaryColor};text-decoration:none;">${data.website}</a></p>` : ''}
    </td>
  </tr>
</table>`,
    };

    return templates[data.template].trim();
  };

  const handleCopyHTML = async () => {
    const html = generateHTML();
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRich = async () => {
    const html = generateHTML();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(html);
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
            <DrawIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" fontWeight={600} color="primary.main">
              Email Signature Generator
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Editor */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Personal Info
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Full Name"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Job Title"
                    value={data.jobTitle}
                    onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Company"
                    value={data.company}
                    onChange={(e) => setData({ ...data, company: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Phone"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Website"
                    value={data.website}
                    onChange={(e) => setData({ ...data, website: e.target.value })}
                    size="small"
                    placeholder="www.example.com"
                  />
                  <TextField
                    label="Profile Image URL"
                    value={data.imageUrl}
                    onChange={(e) => setData({ ...data, imageUrl: e.target.value })}
                    size="small"
                    placeholder="https://..."
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Social Links
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="LinkedIn Username"
                    value={data.linkedin}
                    onChange={(e) => setData({ ...data, linkedin: e.target.value })}
                    size="small"
                    InputProps={{ startAdornment: <LinkedInIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  />
                  <TextField
                    label="Twitter Username"
                    value={data.twitter}
                    onChange={(e) => setData({ ...data, twitter: e.target.value })}
                    size="small"
                    InputProps={{ startAdornment: <TwitterIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  />
                  <TextField
                    label="GitHub Username"
                    value={data.github}
                    onChange={(e) => setData({ ...data, github: e.target.value })}
                    size="small"
                    InputProps={{ startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Style
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Template</InputLabel>
                      <Select
                        value={data.template}
                        label="Template"
                        onChange={(e) => setData({ ...data, template: e.target.value as any })}
                      >
                        <MenuItem value="modern">Modern</MenuItem>
                        <MenuItem value="classic">Classic</MenuItem>
                        <MenuItem value="minimal">Minimal</MenuItem>
                        <MenuItem value="bold">Bold</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box>
                      <Typography variant="caption">Primary Color</Typography>
                      <input
                        type="color"
                        value={data.primaryColor}
                        onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                        style={{ width: '100%', height: 40, cursor: 'pointer' }}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.showImage}
                          onChange={(e) => setData({ ...data, showImage: e.target.checked })}
                        />
                      }
                      label="Show Profile Image"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.showSocial}
                          onChange={(e) => setData({ ...data, showSocial: e.target.checked })}
                        />
                      }
                      label="Show Social Links"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={data.showDivider}
                          onChange={(e) => setData({ ...data, showDivider: e.target.checked })}
                        />
                      }
                      label="Show Divider"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Preview */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                  <Tab label="Preview" />
                  <Tab label="HTML Code" icon={<CodeIcon />} iconPosition="start" />
                </Tabs>

                {tab === 0 ? (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Live Preview
                    </Typography>
                    <Paper
                      ref={previewRef}
                      sx={{ p: 3, bgcolor: '#ffffff', color: '#333', minHeight: 200 }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
                    </Paper>

                    {copied && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Copied to clipboard!
                      </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopyRich}
                        fullWidth
                      >
                        Copy Signature
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CodeIcon />}
                        onClick={handleCopyHTML}
                        fullWidth
                      >
                        Copy HTML
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      HTML Code
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={15}
                      value={generateHTML()}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: 'monospace',
                          fontSize: 12,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyHTML}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Copy HTML Code
                    </Button>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
