import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Chip, Divider,
  Switch, FormControlLabel, Checkbox,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Download from '@mui/icons-material/Download';
import Description from '@mui/icons-material/Description';

const BADGES = [
  { key: 'build', label: 'Build Status', template: (name: string) => `![Build Status](https://img.shields.io/github/actions/workflow/status/user/${name}/ci.yml?branch=main)` },
  { key: 'npm', label: 'NPM Version', template: (name: string) => `![npm](https://img.shields.io/npm/v/${name})` },
  { key: 'license', label: 'License', template: (_: string, lic: string) => `![License](https://img.shields.io/badge/license-${lic}-blue)` },
  { key: 'coverage', label: 'Coverage', template: (name: string) => `![Coverage](https://img.shields.io/codecov/c/github/user/${name})` },
  { key: 'downloads', label: 'Downloads', template: (name: string) => `![Downloads](https://img.shields.io/npm/dm/${name})` },
];

const LICENSE_OPTIONS = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-2-Clause', 'ISC', 'Unlicense'];

const INSTALL_TEMPLATES: Record<string, string> = {
  npm: 'npm install {{name}}',
  yarn: 'yarn add {{name}}',
  pip: 'pip install {{name}}',
  docker: 'docker pull {{name}}',
};

interface SectionConfig {
  key: string;
  label: string;
  enabled: boolean;
  content: string;
}

export default function App() {
  const [projectName, setProjectName] = useState('my-awesome-project');
  const [description, setDescription] = useState('A brief description of what this project does and who it is for.');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>(['build', 'license']);
  const [license, setLicense] = useState('MIT');
  const [techStack, setTechStack] = useState('React, TypeScript, Node.js');
  const [prerequisites, setPrerequisites] = useState('Node.js >= 18\nnpm >= 9');
  const [installMethod, setInstallMethod] = useState('npm');
  const [snackbar, setSnackbar] = useState('');

  const [sections, setSections] = useState<SectionConfig[]>([
    { key: 'toc', label: 'Table of Contents', enabled: true, content: '' },
    { key: 'installation', label: 'Installation', enabled: true, content: '' },
    { key: 'usage', label: 'Usage', enabled: true, content: '```javascript\nimport { something } from \'{{name}}\';\n\n// Example usage\nconst result = something();\nconsole.log(result);\n```' },
    { key: 'api', label: 'API Reference', enabled: false, content: '#### `functionName(param)`\n\n| Parameter | Type     | Description                |\n| :-------- | :------- | :------------------------- |\n| `param`   | `string` | **Required**. Description  |' },
    { key: 'config', label: 'Configuration', enabled: false, content: '| Option | Type | Default | Description |\n|--------|------|---------|-------------|\n| `port` | `number` | `3000` | Server port |' },
    { key: 'contributing', label: 'Contributing', enabled: true, content: 'Contributions are always welcome!\n\n1. Fork the project\n2. Create your feature branch (`git checkout -b feature/amazing-feature`)\n3. Commit your changes (`git commit -m \'Add some amazing feature\'`)\n4. Push to the branch (`git push origin feature/amazing-feature`)\n5. Open a Pull Request' },
    { key: 'license', label: 'License', enabled: true, content: '' },
    { key: 'acknowledgments', label: 'Acknowledgments', enabled: false, content: '- [Awesome README](https://github.com/matiassingers/awesome-readme)\n- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)' },
    { key: 'faq', label: 'FAQ', enabled: false, content: '#### Question 1\n\nAnswer 1\n\n#### Question 2\n\nAnswer 2' },
    { key: 'roadmap', label: 'Roadmap', enabled: false, content: '- [x] Initial release\n- [ ] Feature A\n- [ ] Feature B\n- [ ] Multi-language support' },
    { key: 'contact', label: 'Contact', enabled: false, content: 'Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email@example.com' },
  ]);

  const toggleSection = (key: string) => {
    setSections(sections.map((s) => s.key === key ? { ...s, enabled: !s.enabled } : s));
  };

  const updateSectionContent = (key: string, content: string) => {
    setSections(sections.map((s) => s.key === key ? { ...s, content } : s));
  };

  const generateMarkdown = (): string => {
    const name = projectName || 'project';
    let md = '';

    if (logoUrl) md += `<p align="center"><img src="${logoUrl}" alt="${name} logo" width="200"/></p>\n\n`;
    md += `# ${name}\n\n`;

    // Badges
    const badgeLines = selectedBadges.map((bk) => {
      const badge = BADGES.find((b) => b.key === bk);
      return badge ? badge.template(name, license) : '';
    }).filter(Boolean);
    if (badgeLines.length) md += badgeLines.join(' ') + '\n\n';

    md += `${description}\n\n`;

    // Tech stack badges
    if (techStack.trim()) {
      const techs = techStack.split(',').map((t) => t.trim()).filter(Boolean);
      md += techs.map((t) => `![${t}](https://img.shields.io/badge/-${encodeURIComponent(t)}-333?style=flat&logo=${encodeURIComponent(t.toLowerCase())})`).join(' ') + '\n\n';
    }

    // TOC
    const enabledSections = sections.filter((s) => s.enabled && s.key !== 'toc');
    if (sections.find((s) => s.key === 'toc')?.enabled && enabledSections.length) {
      md += '## Table of Contents\n\n';
      enabledSections.forEach((s) => {
        md += `- [${s.label}](#${s.label.toLowerCase().replace(/\s+/g, '-')})\n`;
      });
      md += '\n';
    }

    // Prerequisites
    if (prerequisites.trim() && sections.find((s) => s.key === 'installation')?.enabled) {
      md += '## Prerequisites\n\n';
      prerequisites.split('\n').filter(Boolean).forEach((p) => { md += `- ${p}\n`; });
      md += '\n';
    }

    // Installation
    if (sections.find((s) => s.key === 'installation')?.enabled) {
      md += '## Installation\n\n';
      md += '```bash\n' + INSTALL_TEMPLATES[installMethod].replace('{{name}}', name) + '\n```\n\n';
    }

    // Other sections
    for (const sec of sections) {
      if (!sec.enabled || sec.key === 'toc' || sec.key === 'installation') continue;
      if (sec.key === 'license') {
        md += `## License\n\nDistributed under the ${license} License. See \`LICENSE\` for more information.\n\n`;
        continue;
      }
      const content = (sec.content || '').replace(/\{\{name\}\}/g, name);
      md += `## ${sec.label}\n\n${content}\n\n`;
    }

    return md;
  };

  const markdown = generateMarkdown();

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setSnackbar('README copied to clipboard');
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'README.md'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Description sx={{ color: '#3b82f6', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.300' }}>README Generator</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Editor */}
          <Box sx={{ flex: '1 1 440px', minWidth: 320 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Project Details</Typography>
              <TextField fullWidth size="small" label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              <TextField fullWidth size="small" label="Description" multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              <TextField fullWidth size="small" label="Logo URL (optional)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              <TextField fullWidth size="small" label="Tech Stack (comma-separated)" value={techStack} onChange={(e) => setTechStack(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
            </Paper>

            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Badges</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {BADGES.map((b) => (
                  <Chip key={b.key} label={b.label} size="small"
                    onClick={() => setSelectedBadges(selectedBadges.includes(b.key) ? selectedBadges.filter((x) => x !== b.key) : [...selectedBadges, b.key])}
                    sx={{ bgcolor: selectedBadges.includes(b.key) ? '#3b82f622' : 'transparent', color: selectedBadges.includes(b.key) ? '#60a5fa' : 'grey.500', border: `1px solid ${selectedBadges.includes(b.key) ? '#3b82f6' : '#333'}` }} />
                ))}
              </Box>
            </Paper>

            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>License</InputLabel>
                  <Select value={license} onChange={(e) => setLicense(e.target.value)} label="License"
                    sx={{ color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {LICENSE_OPTIONS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Install</InputLabel>
                  <Select value={installMethod} onChange={(e) => setInstallMethod(e.target.value)} label="Install"
                    sx={{ color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                    {Object.keys(INSTALL_TEMPLATES).map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <TextField fullWidth size="small" label="Prerequisites (one per line)" multiline rows={2} value={prerequisites} onChange={(e) => setPrerequisites(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
            </Paper>

            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Sections</Typography>
              {sections.map((sec) => (
                <Box key={sec.key} sx={{ mb: 1.5 }}>
                  <FormControlLabel
                    control={<Checkbox size="small" checked={sec.enabled} onChange={() => toggleSection(sec.key)} sx={{ color: 'grey.600', '&.Mui-checked': { color: '#3b82f6' } }} />}
                    label={<Typography variant="body2" sx={{ color: sec.enabled ? 'grey.300' : 'grey.600', fontWeight: 600 }}>{sec.label}</Typography>}
                  />
                  {sec.enabled && sec.key !== 'toc' && sec.key !== 'installation' && sec.key !== 'license' && (
                    <TextField fullWidth size="small" multiline rows={3} value={sec.content} onChange={(e) => updateSectionContent(sec.key, e.target.value)}
                      sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { color: 'grey.300', fontFamily: 'monospace', fontSize: '0.8rem' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#222' } }} />
                  )}
                </Box>
              ))}
            </Paper>
          </Box>

          {/* Preview */}
          <Box sx={{ flex: '1 1 450px', minWidth: 320 }}>
            <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', position: 'sticky', top: 16 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>README.md Preview</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Copy"><IconButton size="small" onClick={copy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Download"><IconButton size="small" onClick={download} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
              <Box sx={{
                p: 2, bgcolor: '#0d0d0d', borderRadius: 1, border: '1px solid #1a1a1a',
                fontFamily: 'monospace', fontSize: '0.78rem', color: '#93c5fd',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 700, overflow: 'auto',
              }}>
                {markdown}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
