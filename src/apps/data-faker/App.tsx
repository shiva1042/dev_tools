import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Refresh,
  Download,
  Add,
  Delete,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Field {
  id: string;
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

type OutputFormat = 'json' | 'csv' | 'sql';

const fieldTypes = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'fullName', label: 'Full Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'username', label: 'Username' },
  { value: 'password', label: 'Password' },
  { value: 'uuid', label: 'UUID' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'DateTime' },
  { value: 'address', label: 'Address' },
  { value: 'city', label: 'City' },
  { value: 'country', label: 'Country' },
  { value: 'zipCode', label: 'Zip Code' },
  { value: 'latitude', label: 'Latitude' },
  { value: 'longitude', label: 'Longitude' },
  { value: 'company', label: 'Company' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'url', label: 'URL' },
  { value: 'ipv4', label: 'IPv4' },
  { value: 'ipv6', label: 'IPv6' },
  { value: 'color', label: 'Color (Hex)' },
  { value: 'word', label: 'Word' },
  { value: 'sentence', label: 'Sentence' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'custom', label: 'Custom List' },
];

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com', 'company.org'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'Mexico'];
const companies = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne Systems', 'Aperture Science', 'Massive Dynamic', 'Oscorp'];
const jobTitles = ['Software Engineer', 'Product Manager', 'Designer', 'Data Analyst', 'Marketing Manager', 'Sales Representative', 'HR Manager', 'Financial Analyst', 'Operations Manager', 'Customer Support'];
const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'labore', 'dolore', 'magna', 'aliqua'];

const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generateValue = (type: string, options?: Record<string, unknown>): unknown => {
  switch (type) {
    case 'firstName': return randomItem(firstNames);
    case 'lastName': return randomItem(lastNames);
    case 'fullName': return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
    case 'email': return `${randomItem(firstNames).toLowerCase()}${randomNumber(1, 999)}@${randomItem(domains)}`;
    case 'phone': return `+1${randomNumber(200, 999)}${randomNumber(200, 999)}${randomNumber(1000, 9999)}`;
    case 'username': return `${randomItem(firstNames).toLowerCase()}${randomNumber(1, 9999)}`;
    case 'password': return Array(12).fill(0).map(() => String.fromCharCode(randomNumber(33, 126))).join('');
    case 'uuid': return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); });
    case 'number': return randomNumber(options?.min as number || 1, options?.max as number || 1000);
    case 'boolean': return Math.random() > 0.5;
    case 'date': {
      const start = new Date(2020, 0, 1).getTime();
      const end = new Date().getTime();
      return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
    }
    case 'datetime': {
      const start = new Date(2020, 0, 1).getTime();
      const end = new Date().getTime();
      return new Date(start + Math.random() * (end - start)).toISOString();
    }
    case 'address': return `${randomNumber(100, 9999)} ${randomItem(['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm'])} ${randomItem(['St', 'Ave', 'Blvd', 'Rd', 'Ln'])}`;
    case 'city': return randomItem(cities);
    case 'country': return randomItem(countries);
    case 'zipCode': return String(randomNumber(10000, 99999));
    case 'latitude': return (Math.random() * 180 - 90).toFixed(6);
    case 'longitude': return (Math.random() * 360 - 180).toFixed(6);
    case 'company': return randomItem(companies);
    case 'jobTitle': return randomItem(jobTitles);
    case 'url': return `https://${randomItem(['www.', ''])}${randomItem(firstNames).toLowerCase()}.${randomItem(['com', 'org', 'net', 'io'])}`;
    case 'ipv4': return `${randomNumber(1, 255)}.${randomNumber(0, 255)}.${randomNumber(0, 255)}.${randomNumber(0, 255)}`;
    case 'ipv6': return Array(8).fill(0).map(() => randomNumber(0, 65535).toString(16).padStart(4, '0')).join(':');
    case 'color': return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    case 'word': return randomItem(words);
    case 'sentence': return Array(randomNumber(5, 10)).fill(0).map(() => randomItem(words)).join(' ') + '.';
    case 'paragraph': return Array(randomNumber(3, 6)).fill(0).map(() => Array(randomNumber(8, 15)).fill(0).map(() => randomItem(words)).join(' ')).join('. ') + '.';
    case 'custom': return randomItem((options?.values as string[]) || ['A', 'B', 'C']);
    default: return null;
  }
};

export default function DataFaker() {
  const [fields, setFields] = useState<Field[]>([
    { id: '1', name: 'id', type: 'uuid' },
    { id: '2', name: 'name', type: 'fullName' },
    { id: '3', name: 'email', type: 'email' },
    { id: '4', name: 'phone', type: 'phone' },
    { id: '5', name: 'company', type: 'company' },
  ]);
  const [count, setCount] = useState<number>(10);
  const [output, setOutput] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json');
  const [tableName, setTableName] = useState<string>('users');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const generateData = useCallback(() => {
    const data: Record<string, unknown>[] = [];
    for (let i = 0; i < count; i++) {
      const row: Record<string, unknown> = {};
      fields.forEach(field => {
        row[field.name] = generateValue(field.type, field.options);
      });
      data.push(row);
    }

    let result = '';
    switch (outputFormat) {
      case 'json':
        result = JSON.stringify(data, null, 2);
        break;
      case 'csv':
        const headers = fields.map(f => f.name).join(',');
        const rows = data.map(row => fields.map(f => {
          const val = row[f.name];
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val);
        }).join(','));
        result = [headers, ...rows].join('\n');
        break;
      case 'sql':
        const columns = fields.map(f => f.name).join(', ');
        const values = data.map(row => {
          const vals = fields.map(f => {
            const val = row[f.name];
            if (typeof val === 'string') return `'${String(val).replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            return String(val);
          }).join(', ');
          return `(${vals})`;
        }).join(',\n');
        result = `INSERT INTO ${tableName} (${columns})\nVALUES\n${values};`;
        break;
    }
    setOutput(result);
  }, [fields, count, outputFormat, tableName]);

  const handleAddField = () => {
    setFields([...fields, { id: String(Date.now()), name: 'field', type: 'word' }]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleFieldChange = (id: string, key: keyof Field, value: unknown) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const ext = outputFormat === 'json' ? 'json' : outputFormat === 'csv' ? 'csv' : 'sql';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Data Faker Generator</Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Fields Panel */}
        <Box sx={{ width: 400, borderRight: '1px solid #222', p: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Fields ({fields.length})</Typography>
            <Button size="small" startIcon={<Add />} onClick={handleAddField} sx={{ color: 'grey.400' }}>Add</Button>
          </Box>

          {fields.map((field) => (
            <Paper key={field.id} sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Name"
                  value={field.name}
                  onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
                />
                <IconButton size="small" onClick={() => handleRemoveField(field.id)} sx={{ color: 'grey.500' }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                <Select
                  value={field.type}
                  label="Type"
                  onChange={(e) => handleFieldChange(field.id, 'type', e.target.value)}
                  sx={{ color: 'grey.300' }}
                >
                  {fieldTypes.map(ft => (
                    <MenuItem key={ft.value} value={ft.value}>{ft.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          ))}

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Number of Records"
              type="number"
              value={count}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1) setCount(val);
                else if (e.target.value === '') setCount(1);
              }}
              inputProps={{ min: 1 }}
              placeholder="e.g. 1000, 5000, 10000"
              sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300' } }}
            />

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel sx={{ color: 'grey.500' }}>Output Format</InputLabel>
              <Select
                value={outputFormat}
                label="Output Format"
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                sx={{ color: 'grey.300' }}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="sql">SQL INSERT</MenuItem>
              </Select>
            </FormControl>

            {outputFormat === 'sql' && (
              <TextField
                fullWidth
                size="small"
                label="Table Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300' } }}
              />
            )}

            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              onClick={generateData}
              sx={{ bgcolor: '#2563eb' }}
            >
              Generate Data
            </Button>
          </Paper>
        </Box>

        {/* Output Panel */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Output</Typography>
            <Box>
              <Tooltip title="Copy">
                <IconButton size="small" onClick={handleCopy} disabled={!output} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton size="small" onClick={handleDownload} disabled={!output} sx={{ color: 'grey.500' }}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Paper sx={{ flex: 1, bgcolor: '#111', border: '1px solid #222', p: 2, overflow: 'auto' }}>
            <Typography
              component="pre"
              sx={{ fontFamily: 'monospace', fontSize: 13, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}
            >
              {output || 'Click "Generate Data" to create fake data...'}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
