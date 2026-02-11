import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Snackbar,
  Chip,
} from '@mui/material';
import {
  Home,
  ContentCopy,
  Code,
  PlayArrow,
  Clear,
} from '@mui/icons-material';

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  data: string;
  auth: string;
  cookies: string;
  formData: Record<string, string>;
}

function parseCurl(input: string): ParsedCurl {
  const result: ParsedCurl = { url: '', method: 'GET', headers: {}, data: '', auth: '', cookies: '', formData: {} };
  const raw = input.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (!raw.toLowerCase().startsWith('curl')) return result;

  const tokens: string[] = [];
  let current = '';
  let inQuote = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (!inQuote && (ch === '"' || ch === "'")) { inQuote = ch; continue; }
    if (ch === inQuote) { inQuote = ''; continue; }
    if (!inQuote && ch === ' ') { if (current) tokens.push(current); current = ''; continue; }
    current += ch;
  }
  if (current) tokens.push(current);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'curl') continue;
    if (t === '-X' || t === '--request') { result.method = tokens[++i]?.toUpperCase() || 'GET'; continue; }
    if (t === '-H' || t === '--header') {
      const h = tokens[++i] || '';
      const idx = h.indexOf(':');
      if (idx > 0) result.headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim();
      continue;
    }
    if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') { result.data = tokens[++i] || ''; continue; }
    if (t === '-u' || t === '--user') { result.auth = tokens[++i] || ''; continue; }
    if (t === '-b' || t === '--cookie') { result.cookies = tokens[++i] || ''; continue; }
    if (t === '-F' || t === '--form') {
      const f = tokens[++i] || '';
      const eqIdx = f.indexOf('=');
      if (eqIdx > 0) result.formData[f.slice(0, eqIdx)] = f.slice(eqIdx + 1);
      continue;
    }
    if (!t.startsWith('-') && (t.startsWith('http') || t.startsWith('/'))) { result.url = t; continue; }
  }

  if (result.data && result.method === 'GET') result.method = 'POST';
  return result;
}

function genPython(p: ParsedCurl): string {
  const lines = ['import requests', ''];
  const hasJson = p.headers['Content-Type']?.includes('application/json');
  const args: string[] = [];
  if (Object.keys(p.headers).length) {
    lines.push('headers = {');
    Object.entries(p.headers).forEach(([k, v]) => lines.push(`    "${k}": "${v}",`));
    lines.push('}');
    args.push('headers=headers');
  }
  if (p.data) {
    if (hasJson) { lines.push(`json_data = ${p.data}`); args.push('json=json_data'); }
    else { lines.push(`data = '${p.data}'`); args.push('data=data'); }
  }
  if (p.auth) { const [u, pw] = p.auth.split(':'); args.push(`auth=("${u}", "${pw || ''}")`); }
  if (p.cookies) { lines.push(`cookies = {"${p.cookies.replace(/=/g, '": "').replace(/;\s*/g, '", "')}"}`); args.push('cookies=cookies'); }
  lines.push('');
  lines.push(`response = requests.${p.method.toLowerCase()}(`);
  lines.push(`    "${p.url}",`);
  args.forEach(a => lines.push(`    ${a},`));
  lines.push(')');
  lines.push('');
  lines.push('print(response.status_code)');
  lines.push('print(response.text)');
  return lines.join('\n');
}

function genNodeFetch(p: ParsedCurl): string {
  const lines = ['const options = {'];
  lines.push(`  method: '${p.method}',`);
  if (Object.keys(p.headers).length || p.auth) {
    lines.push('  headers: {');
    Object.entries(p.headers).forEach(([k, v]) => lines.push(`    '${k}': '${v}',`));
    if (p.auth) { lines.push(`    'Authorization': 'Basic ' + btoa('${p.auth}'),`); }
    if (p.cookies) lines.push(`    'Cookie': '${p.cookies}',`);
    lines.push('  },');
  }
  if (p.data) lines.push(`  body: ${p.headers['Content-Type']?.includes('json') ? `JSON.stringify(${p.data})` : `'${p.data}'`},`);
  lines.push('};');
  lines.push('');
  lines.push(`const response = await fetch('${p.url}', options);`);
  lines.push('const data = await response.json();');
  lines.push('console.log(data);');
  return lines.join('\n');
}

function genAxios(p: ParsedCurl): string {
  const lines = ["import axios from 'axios';", ''];
  lines.push('const response = await axios({');
  lines.push(`  method: '${p.method.toLowerCase()}',`);
  lines.push(`  url: '${p.url}',`);
  if (Object.keys(p.headers).length) {
    lines.push('  headers: {');
    Object.entries(p.headers).forEach(([k, v]) => lines.push(`    '${k}': '${v}',`));
    lines.push('  },');
  }
  if (p.data) lines.push(`  data: ${p.data},`);
  if (p.auth) { const [u, pw] = p.auth.split(':'); lines.push(`  auth: { username: '${u}', password: '${pw || ''}' },`); }
  lines.push('});');
  lines.push('');
  lines.push('console.log(response.data);');
  return lines.join('\n');
}

function genJava(p: ParsedCurl): string {
  const lines = [
    'import java.net.URI;',
    'import java.net.http.HttpClient;',
    'import java.net.http.HttpRequest;',
    'import java.net.http.HttpResponse;',
    '',
    'HttpClient client = HttpClient.newHttpClient();',
    '',
  ];
  const hasBody = !!p.data;
  lines.push(`HttpRequest.Builder builder = HttpRequest.newBuilder()`);
  lines.push(`    .uri(URI.create("${p.url}"))`);
  Object.entries(p.headers).forEach(([k, v]) => lines.push(`    .header("${k}", "${v}")`));
  if (p.auth) lines.push(`    .header("Authorization", "Basic " + java.util.Base64.getEncoder().encodeToString("${p.auth}".getBytes()))`);
  if (hasBody) lines.push(`    .${p.method}(HttpRequest.BodyPublishers.ofString(${JSON.stringify(p.data)}))`);
  else lines.push(`    .${p.method === 'GET' ? 'GET' : p.method}(${p.method !== 'GET' ? 'HttpRequest.BodyPublishers.noBody()' : ''})`);
  lines.push('    .build();');
  lines.push('');
  lines.push('HttpResponse<String> response = client.send(builder, HttpResponse.BodyHandlers.ofString());');
  lines.push('System.out.println(response.statusCode());');
  lines.push('System.out.println(response.body());');
  return lines.join('\n');
}

function genGo(p: ParsedCurl): string {
  const lines = [
    'package main',
    '',
    'import (',
    '    "fmt"',
    '    "io"',
    '    "net/http"',
    p.data ? '    "strings"' : '',
    ')',
    '',
    'func main() {',
  ];
  if (p.data) lines.push(`    body := strings.NewReader(\`${p.data}\`)`);
  lines.push(`    req, err := http.NewRequest("${p.method}", "${p.url}", ${p.data ? 'body' : 'nil'})`);
  lines.push('    if err != nil { panic(err) }');
  Object.entries(p.headers).forEach(([k, v]) => lines.push(`    req.Header.Set("${k}", "${v}")`));
  if (p.auth) { const [u, pw] = p.auth.split(':'); lines.push(`    req.SetBasicAuth("${u}", "${pw || ''}")`); }
  if (p.cookies) lines.push(`    req.Header.Set("Cookie", "${p.cookies}")`);
  lines.push('');
  lines.push('    client := &http.Client{}');
  lines.push('    resp, err := client.Do(req)');
  lines.push('    if err != nil { panic(err) }');
  lines.push('    defer resp.Body.Close()');
  lines.push('');
  lines.push('    bodyBytes, _ := io.ReadAll(resp.Body)');
  lines.push('    fmt.Println(string(bodyBytes))');
  lines.push('}');
  return lines.filter(l => l !== '').join('\n').replace(/\n\n\n+/g, '\n\n');
}

function genPhp(p: ParsedCurl): string {
  const lines = ['<?php', '', '$ch = curl_init();', ''];
  lines.push(`curl_setopt($ch, CURLOPT_URL, "${p.url}");`);
  lines.push('curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);');
  if (p.method !== 'GET') lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${p.method}");`);
  if (Object.keys(p.headers).length) {
    lines.push('curl_setopt($ch, CURLOPT_HTTPHEADER, [');
    Object.entries(p.headers).forEach(([k, v]) => lines.push(`    "${k}: ${v}",`));
    lines.push(']);');
  }
  if (p.data) lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${p.data}');`);
  if (p.auth) lines.push(`curl_setopt($ch, CURLOPT_USERPWD, "${p.auth}");`);
  if (p.cookies) lines.push(`curl_setopt($ch, CURLOPT_COOKIE, "${p.cookies}");`);
  lines.push('');
  lines.push('$response = curl_exec($ch);');
  lines.push('$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);');
  lines.push('curl_close($ch);');
  lines.push('');
  lines.push('echo $httpCode . "\\n";');
  lines.push('echo $response;');
  return lines.join('\n');
}

function genRuby(p: ParsedCurl): string {
  const lines = ["require 'net/http'", "require 'uri'", "require 'json'", ''];
  lines.push(`uri = URI.parse("${p.url}")`);
  lines.push(`http = Net::HTTP.new(uri.host, uri.port)`);
  lines.push(`http.use_ssl = uri.scheme == 'https'`);
  lines.push('');
  const cls = p.method === 'GET' ? 'Get' : p.method === 'POST' ? 'Post' : p.method === 'PUT' ? 'Put' : p.method === 'DELETE' ? 'Delete' : 'Get';
  lines.push(`request = Net::HTTP::${cls}.new(uri.request_uri)`);
  Object.entries(p.headers).forEach(([k, v]) => lines.push(`request["${k}"] = "${v}"`));
  if (p.auth) { const [u, pw] = p.auth.split(':'); lines.push(`request.basic_auth("${u}", "${pw || ''}")`); }
  if (p.data) lines.push(`request.body = '${p.data}'`);
  lines.push('');
  lines.push('response = http.request(request)');
  lines.push('puts response.code');
  lines.push('puts response.body');
  return lines.join('\n');
}

function genCsharp(p: ParsedCurl): string {
  const lines = ['using System.Net.Http;', 'using System.Text;', ''];
  lines.push('var client = new HttpClient();');
  if (p.auth) lines.push(`client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes("${p.auth}")));`);
  Object.entries(p.headers).forEach(([k, v]) => {
    if (k.toLowerCase() !== 'content-type') lines.push(`client.DefaultRequestHeaders.Add("${k}", "${v}");`);
  });
  lines.push('');
  const ct = p.headers['Content-Type'] || 'text/plain';
  if (p.data) lines.push(`var content = new StringContent(${JSON.stringify(p.data)}, Encoding.UTF8, "${ct}");`);
  lines.push(`var response = await client.${p.method === 'GET' ? 'GetAsync' : p.method === 'POST' ? 'PostAsync' : p.method === 'PUT' ? 'PutAsync' : 'DeleteAsync'}("${p.url}"${p.data ? ', content' : ''});`);
  lines.push('var body = await response.Content.ReadAsStringAsync();');
  lines.push('Console.WriteLine(response.StatusCode);');
  lines.push('Console.WriteLine(body);');
  return lines.join('\n');
}

function genRust(p: ParsedCurl): string {
  const lines = ['use reqwest;', '', '#[tokio::main]', 'async fn main() -> Result<(), reqwest::Error> {'];
  lines.push('    let client = reqwest::Client::new();');
  lines.push(`    let response = client.${p.method.toLowerCase()}("${p.url}")`);
  Object.entries(p.headers).forEach(([k, v]) => lines.push(`        .header("${k}", "${v}")`));
  if (p.auth) { const [u, pw] = p.auth.split(':'); lines.push(`        .basic_auth("${u}", Some("${pw || ''}"))`); }
  if (p.data) lines.push(`        .body(r#"${p.data}"#)`);
  lines.push('        .send()');
  lines.push('        .await?;');
  lines.push('');
  lines.push('    println!("Status: {}", response.status());');
  lines.push('    let body = response.text().await?;');
  lines.push('    println!("{}", body);');
  lines.push('    Ok(())');
  lines.push('}');
  return lines.join('\n');
}

const LANGUAGES = [
  { label: 'Python', key: 'python' },
  { label: 'Node (fetch)', key: 'fetch' },
  { label: 'Node (axios)', key: 'axios' },
  { label: 'Java', key: 'java' },
  { label: 'Go', key: 'go' },
  { label: 'PHP', key: 'php' },
  { label: 'Ruby', key: 'ruby' },
  { label: 'C#', key: 'csharp' },
  { label: 'Rust', key: 'rust' },
];

const GENERATORS: Record<string, (p: ParsedCurl) => string> = {
  python: genPython, fetch: genNodeFetch, axios: genAxios, java: genJava,
  go: genGo, php: genPhp, ruby: genRuby, csharp: genCsharp, rust: genRust,
};

const SAMPLE = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer tok_abc123" \\
  -d '{"name": "John", "email": "john@example.com"}'`;

export default function CurlToCode() {
  const [input, setInput] = useState('');
  const [tab, setTab] = useState(0);
  const [snackOpen, setSnackOpen] = useState(false);

  const parsed = parseCurl(input);
  const langKey = LANGUAGES[tab]?.key || 'python';
  const output = input.trim() ? GENERATORS[langKey](parsed) : '';

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setSnackOpen(true);
  }, [output]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Code sx={{ color: '#8b5cf6' }} />
          <Typography variant="h5" fontWeight={700}>Curl to Code Converter</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">Curl Command</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" sx={{ borderColor: '#333', color: 'grey.400', textTransform: 'none' }} onClick={() => setInput(SAMPLE)}>
                    Sample
                  </Button>
                  <Tooltip title="Clear"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={() => setInput('')}><Clear /></IconButton></Tooltip>
                </Box>
              </Box>
              <TextField
                multiline rows={12} fullWidth value={input} onChange={e => setInput(e.target.value)}
                placeholder="Paste your curl command here..."
                sx={{ '& .MuiInputBase-root': { bgcolor: '#0d0d0d', fontFamily: 'monospace', fontSize: 13, color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#222' } }}
              />
            </Paper>

            {input.trim() && (
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 2 }}>
                <Typography variant="subtitle2" color="grey.400" mb={1}>Parsed Details</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Chip label={parsed.method} size="small" sx={{ bgcolor: '#8b5cf620', color: '#8b5cf6', fontWeight: 700 }} />
                  {parsed.auth && <Chip label="Auth" size="small" sx={{ bgcolor: '#f59e0b20', color: '#f59e0b' }} />}
                  {parsed.cookies && <Chip label="Cookies" size="small" sx={{ bgcolor: '#10b98120', color: '#10b981' }} />}
                  {Object.keys(parsed.headers).length > 0 && <Chip label={`${Object.keys(parsed.headers).length} Headers`} size="small" sx={{ bgcolor: '#3b82f620', color: '#3b82f6' }} />}
                </Box>
                <Typography variant="body2" color="grey.500" sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>{parsed.url}</Typography>
                {Object.entries(parsed.headers).map(([k, v]) => (
                  <Typography key={k} variant="body2" color="grey.500" sx={{ fontSize: 11 }}>{k}: {v}</Typography>
                ))}
                {parsed.data && <Typography variant="body2" color="grey.500" sx={{ fontFamily: 'monospace', fontSize: 11, mt: 0.5 }}>Body: {parsed.data.slice(0, 200)}</Typography>}
              </Paper>
            )}
          </Box>

          <Box>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="grey.400">Output</Typography>
                <Tooltip title="Copy to clipboard"><IconButton size="small" sx={{ color: 'grey.500' }} onClick={copy}><ContentCopy /></IconButton></Tooltip>
              </Box>
              <Tabs
                value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                sx={{ mb: 1, minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0.5, textTransform: 'none', fontSize: 12, color: 'grey.500' }, '& .Mui-selected': { color: '#8b5cf6 !important' }, '& .MuiTabs-indicator': { bgcolor: '#8b5cf6' } }}
              >
                {LANGUAGES.map(l => <Tab key={l.key} label={l.label} />)}
              </Tabs>
              <Box
                sx={{ bgcolor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 1, p: 2, fontFamily: 'monospace', fontSize: 12, color: 'grey.300', whiteSpace: 'pre-wrap', minHeight: 340, maxHeight: 500, overflow: 'auto' }}
              >
                {output || <Typography color="grey.600" fontSize={13}>Paste a curl command to see generated code</Typography>}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={snackOpen} autoHideDuration={2000} onClose={() => setSnackOpen(false)} message="Copied to clipboard" />
    </Box>
  );
}
