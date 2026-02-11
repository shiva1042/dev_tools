import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip,
  Snackbar, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, Tab,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Download from '@mui/icons-material/Download';
import Gavel from '@mui/icons-material/Gavel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Remove from '@mui/icons-material/Remove';

interface LicenseInfo {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  conditions: string[];
  limitations: string[];
  body: string;
}

const ALL_PERMISSIONS = ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'];
const ALL_CONDITIONS = ['License notice', 'State changes', 'Disclose source', 'Same license', 'Network use is distribution'];
const ALL_LIMITATIONS = ['Liability', 'Warranty', 'Trademark use'];

const LICENSES: LicenseInfo[] = [
  {
    id: 'MIT', name: 'MIT License',
    description: 'A short and simple permissive license with conditions only requiring preservation of copyright and license notices.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: ['License notice'],
    limitations: ['Liability', 'Warranty'],
    body: `MIT License

Copyright (c) {{year}} {{author}}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    id: 'Apache-2.0', name: 'Apache License 2.0',
    description: 'A permissive license that also provides an express grant of patent rights from contributors.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
    conditions: ['License notice', 'State changes'],
    limitations: ['Liability', 'Warranty', 'Trademark use'],
    body: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright {{year}} {{author}}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,
  },
  {
    id: 'GPL-3.0', name: 'GNU GPL v3.0',
    description: 'Strong copyleft license that requires derivative works to be licensed under GPL-3.0.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
    conditions: ['License notice', 'State changes', 'Disclose source', 'Same license'],
    limitations: ['Liability', 'Warranty'],
    body: `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) {{year}} {{author}}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.`,
  },
  {
    id: 'GPL-2.0', name: 'GNU GPL v2.0',
    description: 'Copyleft license requiring derivative works to be licensed under GPL-2.0.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: ['License notice', 'State changes', 'Disclose source', 'Same license'],
    limitations: ['Liability', 'Warranty'],
    body: `GNU GENERAL PUBLIC LICENSE
Version 2, June 1991

Copyright (C) {{year}} {{author}}

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.`,
  },
  {
    id: 'BSD-2-Clause', name: 'BSD 2-Clause',
    description: 'A permissive license that comes in two variants, the simplified and the new BSD.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: ['License notice'],
    limitations: ['Liability', 'Warranty'],
    body: `BSD 2-Clause License

Copyright (c) {{year}}, {{author}}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES ARISING OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    id: 'BSD-3-Clause', name: 'BSD 3-Clause',
    description: 'Similar to BSD-2-Clause, but with a non-endorsement clause.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: ['License notice'],
    limitations: ['Liability', 'Warranty'],
    body: `BSD 3-Clause License

Copyright (c) {{year}}, {{author}}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice.
2. Redistributions in binary form must reproduce the above copyright notice.
3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES ARE DISCLAIMED.`,
  },
  {
    id: 'ISC', name: 'ISC License',
    description: 'A permissive license functionally equivalent to the BSD 2-Clause license.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: ['License notice'],
    limitations: ['Liability', 'Warranty'],
    body: `ISC License

Copyright (c) {{year}} {{author}}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE.`,
  },
  {
    id: 'MPL-2.0', name: 'Mozilla Public License 2.0',
    description: 'A weak copyleft license that is file-level, allowing mixing with proprietary code.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
    conditions: ['License notice', 'Disclose source', 'Same license'],
    limitations: ['Liability', 'Warranty', 'Trademark use'],
    body: `Mozilla Public License Version 2.0

Copyright (c) {{year}} {{author}}

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.`,
  },
  {
    id: 'LGPL-3.0', name: 'GNU LGPL v3.0',
    description: 'Allows linking with non-(L)GPL software. Derivative works must be LGPL.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
    conditions: ['License notice', 'State changes', 'Disclose source', 'Same license'],
    limitations: ['Liability', 'Warranty'],
    body: `GNU LESSER GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) {{year}} {{author}}

This library is free software; you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 3 of the License, or (at
your option) any later version.`,
  },
  {
    id: 'AGPL-3.0', name: 'GNU AGPL v3.0',
    description: 'Like GPL-3.0 but also requires source for network server software.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
    conditions: ['License notice', 'State changes', 'Disclose source', 'Same license', 'Network use is distribution'],
    limitations: ['Liability', 'Warranty'],
    body: `GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

Copyright (C) {{year}} {{author}}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.`,
  },
  {
    id: 'Unlicense', name: 'The Unlicense',
    description: 'Dedicates the work to the public domain. No conditions whatsoever.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: [],
    limitations: ['Liability', 'Warranty'],
    body: `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute
this software, either in source code form or as a compiled binary, for any
purpose, commercial or non-commercial, and by any means.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.`,
  },
  {
    id: 'CC0-1.0', name: 'CC0 1.0 Universal',
    description: 'Public domain dedication. Waives all rights to the work.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: [],
    limitations: ['Liability', 'Warranty', 'Trademark use'],
    body: `CC0 1.0 Universal

Copyright (c) {{year}} {{author}}

The person who associated a work with this deed has dedicated the work to
the public domain by waiving all of his or her rights to the work worldwide
under copyright law.`,
  },
  {
    id: 'CC-BY-4.0', name: 'CC BY 4.0',
    description: 'Permits almost any use subject to providing credit to the creator.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: ['License notice', 'State changes'],
    limitations: ['Liability', 'Warranty', 'Trademark use'],
    body: `Creative Commons Attribution 4.0 International

Copyright (c) {{year}} {{author}}

This work is licensed under the Creative Commons Attribution 4.0
International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by/4.0/.`,
  },
  {
    id: 'BSL-1.0', name: 'Boost Software License 1.0',
    description: 'A simple permissive license only requiring preservation of copyright notice for source.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
    conditions: ['License notice'],
    limitations: ['Liability', 'Warranty'],
    body: `Boost Software License - Version 1.0 - August 17th, 2003

Copyright (c) {{year}} {{author}}

Permission is hereby granted, free of charge, to any person or organization
obtaining a copy of the software and accompanying documentation covered by
this license (the "Software") to use, reproduce, display, distribute,
execute, and transmit the Software.`,
  },
  {
    id: 'Artistic-2.0', name: 'Artistic License 2.0',
    description: 'Used primarily for Perl. Allows freedom to modify with some conditions.',
    permissions: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
    conditions: ['License notice', 'State changes'],
    limitations: ['Liability', 'Warranty', 'Trademark use'],
    body: `The Artistic License 2.0

Copyright (c) {{year}} {{author}}

Everyone is permitted to copy and distribute verbatim copies of this license
document, but changing it is not allowed.`,
  },
];

export default function App() {
  const [selectedId, setSelectedId] = useState('MIT');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [author, setAuthor] = useState('');
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState('');

  const selected = useMemo(() => LICENSES.find((l) => l.id === selectedId)!, [selectedId]);

  const licenseText = selected.body.replace(/\{\{year\}\}/g, year || 'YYYY').replace(/\{\{author\}\}/g, author || '[Author Name]');

  const copy = async () => {
    await navigator.clipboard.writeText(licenseText);
    setSnackbar('License text copied');
  };

  const download = () => {
    const blob = new Blob([licenseText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'LICENSE'; a.click();
    URL.revokeObjectURL(url);
  };

  const popularIds = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-2-Clause', 'ISC', 'MPL-2.0', 'AGPL-3.0', 'Unlicense'];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Gavel sx={{ color: '#a78bfa', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.300' }}>License Picker</Typography>
        </Box>

        <Paper sx={{ mb: 2, bgcolor: '#111', border: '1px solid #222' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500' }, '& .Mui-selected': { color: '#a78bfa' } }}>
            <Tab label="Browse & Generate" />
            <Tab label="Comparison Table" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 380px', minWidth: 300 }}>
              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Select License</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {LICENSES.map((l) => (
                    <Chip key={l.id} label={l.id} size="small" onClick={() => setSelectedId(l.id)}
                      sx={{ bgcolor: selectedId === l.id ? '#a78bfa' : 'transparent', color: selectedId === l.id ? '#fff' : 'grey.400', border: `1px solid ${selectedId === l.id ? '#a78bfa' : '#333'}`, fontFamily: 'monospace', fontWeight: 600, fontSize: '0.72rem' }} />
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'grey.300', mb: 0.5 }}>{selected.name}</Typography>
                <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>{selected.description}</Typography>

                <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 700, display: 'block', mb: 0.5 }}>Permissions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                  {selected.permissions.map((p) => <Chip key={p} label={p} size="small" sx={{ bgcolor: '#16a34a22', color: '#4ade80', fontSize: '0.7rem' }} />)}
                </Box>

                <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 700, display: 'block', mb: 0.5 }}>Conditions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                  {selected.conditions.length > 0
                    ? selected.conditions.map((c) => <Chip key={c} label={c} size="small" sx={{ bgcolor: '#2563eb22', color: '#60a5fa', fontSize: '0.7rem' }} />)
                    : <Typography variant="caption" sx={{ color: 'grey.600' }}>None</Typography>}
                </Box>

                <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700, display: 'block', mb: 0.5 }}>Limitations</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.limitations.map((l) => <Chip key={l} label={l} size="small" sx={{ bgcolor: '#dc262622', color: '#f87171', fontSize: '0.7rem' }} />)}
                </Box>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222' }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Fill in Details</Typography>
                <TextField fullWidth size="small" label="Year" value={year} onChange={(e) => setYear(e.target.value)}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                <TextField fullWidth size="small" label="Author / Organization" value={author} onChange={(e) => setAuthor(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              </Paper>
            </Box>

            <Box sx={{ flex: '1 1 450px', minWidth: 320 }}>
              <Paper sx={{ p: 2.5, bgcolor: '#111', border: '1px solid #222', position: 'sticky', top: 16 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>LICENSE</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Copy"><IconButton size="small" onClick={copy} sx={{ color: 'grey.500' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Download"><IconButton size="small" onClick={download} sx={{ color: 'grey.500' }}><Download fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Box>
                <Box sx={{
                  p: 2, bgcolor: '#0d0d0d', borderRadius: 1, border: '1px solid #1a1a1a',
                  fontFamily: 'monospace', fontSize: '0.78rem', color: '#d8b4fe',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 500, overflow: 'auto',
                }}>
                  {licenseText}
                </Box>
              </Paper>
            </Box>
          </Box>
        )}

        {tab === 1 && (
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', overflow: 'auto' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#111', color: 'grey.400', borderColor: '#222', fontWeight: 700, position: 'sticky', left: 0, zIndex: 3 }}>License</TableCell>
                    {ALL_PERMISSIONS.map((p) => <TableCell key={p} sx={{ bgcolor: '#111', color: '#4ade80', borderColor: '#222', fontSize: '0.7rem', textAlign: 'center' }}>{p}</TableCell>)}
                    {ALL_CONDITIONS.map((c) => <TableCell key={c} sx={{ bgcolor: '#111', color: '#60a5fa', borderColor: '#222', fontSize: '0.7rem', textAlign: 'center' }}>{c}</TableCell>)}
                    {ALL_LIMITATIONS.map((l) => <TableCell key={l} sx={{ bgcolor: '#111', color: '#f87171', borderColor: '#222', fontSize: '0.7rem', textAlign: 'center' }}>{l}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {LICENSES.filter((l) => popularIds.includes(l.id)).map((lic) => (
                    <TableRow key={lic.id} hover onClick={() => { setSelectedId(lic.id); setTab(0); }} sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#1a1a1a' } }}>
                      <TableCell sx={{ color: 'grey.300', borderColor: '#222', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem', position: 'sticky', left: 0, bgcolor: '#111', zIndex: 1 }}>{lic.id}</TableCell>
                      {ALL_PERMISSIONS.map((p) => (
                        <TableCell key={p} sx={{ borderColor: '#222', textAlign: 'center' }}>
                          {lic.permissions.includes(p) ? <CheckCircle sx={{ color: '#4ade80', fontSize: 16 }} /> : <Remove sx={{ color: 'grey.700', fontSize: 16 }} />}
                        </TableCell>
                      ))}
                      {ALL_CONDITIONS.map((c) => (
                        <TableCell key={c} sx={{ borderColor: '#222', textAlign: 'center' }}>
                          {lic.conditions.includes(c) ? <CheckCircle sx={{ color: '#60a5fa', fontSize: 16 }} /> : <Remove sx={{ color: 'grey.700', fontSize: 16 }} />}
                        </TableCell>
                      ))}
                      {ALL_LIMITATIONS.map((l) => (
                        <TableCell key={l} sx={{ borderColor: '#222', textAlign: 'center' }}>
                          {lic.limitations.includes(l) ? <Cancel sx={{ color: '#f87171', fontSize: 16 }} /> : <Remove sx={{ color: 'grey.700', fontSize: 16 }} />}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
