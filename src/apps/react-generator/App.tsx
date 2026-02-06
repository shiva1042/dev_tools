import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  Download,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface PropDefinition {
  id: string;
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

interface StateDefinition {
  id: string;
  name: string;
  type: string;
  initialValue: string;
}

interface ComponentConfig {
  name: string;
  type: 'functional' | 'arrow';
  useTypeScript: boolean;
  exportType: 'default' | 'named';
  props: PropDefinition[];
  states: StateDefinition[];
  hooks: {
    useState: boolean;
    useEffect: boolean;
    useMemo: boolean;
    useCallback: boolean;
    useRef: boolean;
    useContext: boolean;
  };
  features: {
    cssModule: boolean;
    styledComponents: boolean;
    tailwind: boolean;
    forwardRef: boolean;
    memo: boolean;
  };
}

const PROP_TYPES = ['string', 'number', 'boolean', 'object', 'array', 'function', 'React.ReactNode', 'React.CSSProperties', 'any'];

export default function ReactGenerator() {
  const [outputTab, setOutputTab] = useState(0);
  const [config, setConfig] = useState<ComponentConfig>({
    name: 'MyComponent',
    type: 'arrow',
    useTypeScript: true,
    exportType: 'default',
    props: [
      { id: '1', name: 'title', type: 'string', required: true },
      { id: '2', name: 'onClick', type: 'function', required: false },
      { id: '3', name: 'children', type: 'React.ReactNode', required: false },
    ],
    states: [
      { id: '1', name: 'isLoading', type: 'boolean', initialValue: 'false' },
      { id: '2', name: 'data', type: 'any[]', initialValue: '[]' },
    ],
    hooks: {
      useState: true,
      useEffect: true,
      useMemo: false,
      useCallback: false,
      useRef: false,
      useContext: false,
    },
    features: {
      cssModule: false,
      styledComponents: false,
      tailwind: true,
      forwardRef: false,
      memo: false,
    },
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const generatedComponent = useMemo(() => {
    const { name, type, useTypeScript, exportType, props, states, hooks, features } = config;

    // Imports
    const reactImports: string[] = [];
    if (type === 'functional' || type === 'arrow') reactImports.push('React');
    if (hooks.useState || states.length > 0) reactImports.push('useState');
    if (hooks.useEffect) reactImports.push('useEffect');
    if (hooks.useMemo) reactImports.push('useMemo');
    if (hooks.useCallback) reactImports.push('useCallback');
    if (hooks.useRef) reactImports.push('useRef');
    if (hooks.useContext) reactImports.push('useContext');
    if (features.forwardRef) reactImports.push('forwardRef');
    if (features.memo) reactImports.push('memo');

    let code = `import { ${reactImports.join(', ')} } from 'react';\n`;

    if (features.cssModule) {
      code += `import styles from './${name}.module.css';\n`;
    }
    if (features.styledComponents) {
      code += `import styled from 'styled-components';\n`;
    }

    code += '\n';

    // TypeScript interface for props
    if (useTypeScript && props.length > 0) {
      code += `interface ${name}Props {\n`;
      props.forEach(prop => {
        const optional = prop.required ? '' : '?';
        let propType = prop.type;
        if (prop.type === 'function') propType = '() => void';
        if (prop.type === 'array') propType = 'any[]';
        code += `  ${prop.name}${optional}: ${propType};\n`;
      });
      code += '}\n\n';
    }

    // Styled components
    if (features.styledComponents) {
      code += `const Container = styled.div\`
  display: flex;
  flex-direction: column;
  padding: 16px;
\`;\n\n`;
    }

    // Component definition
    const propsParam = useTypeScript && props.length > 0 ? `props: ${name}Props` : 'props';
    const propsDestructure = props.length > 0
      ? `const { ${props.map(p => p.defaultValue ? `${p.name} = ${p.defaultValue}` : p.name).join(', ')} } = props;`
      : '';

    let componentBody = '';

    // State declarations
    if (states.length > 0) {
      states.forEach(state => {
        const typeAnnotation = useTypeScript ? `<${state.type}>` : '';
        componentBody += `  const [${state.name}, set${state.name.charAt(0).toUpperCase() + state.name.slice(1)}] = useState${typeAnnotation}(${state.initialValue});\n`;
      });
      componentBody += '\n';
    }

    // useEffect
    if (hooks.useEffect) {
      componentBody += `  useEffect(() => {
    // Component mounted
    console.log('${name} mounted');

    return () => {
      // Cleanup
      console.log('${name} unmounted');
    };
  }, []);\n\n`;
    }

    // useRef
    if (hooks.useRef) {
      const refType = useTypeScript ? '<HTMLDivElement | null>' : '';
      componentBody += `  const containerRef = useRef${refType}(null);\n\n`;
    }

    // useMemo example
    if (hooks.useMemo) {
      componentBody += `  const computedValue = useMemo(() => {
    // Expensive computation
    return null;
  }, []);\n\n`;
    }

    // useCallback example
    if (hooks.useCallback) {
      componentBody += `  const handleClick = useCallback(() => {
    // Handle click
  }, []);\n\n`;
    }

    // JSX
    let jsxContent = '';
    if (features.styledComponents) {
      jsxContent = `    <Container>
      <h1>{title}</h1>
      {children}
    </Container>`;
    } else if (features.tailwind) {
      jsxContent = `    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {children}
    </div>`;
    } else if (features.cssModule) {
      jsxContent = `    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      {children}
    </div>`;
    } else {
      jsxContent = `    <div>
      <h1>{title}</h1>
      {children}
    </div>`;
    }

    componentBody += `  return (\n${jsxContent}\n  );`;

    // Build component
    if (features.forwardRef) {
      const refType = useTypeScript ? '<HTMLDivElement, ' + name + 'Props>' : '';
      if (type === 'arrow') {
        code += `const ${name} = forwardRef${refType}((${propsParam}, ref) => {\n`;
        if (propsDestructure) code += `  ${propsDestructure}\n\n`;
        code += componentBody;
        code += '\n});\n';
      } else {
        code += `const ${name} = forwardRef${refType}(function ${name}(${propsParam}, ref) {\n`;
        if (propsDestructure) code += `  ${propsDestructure}\n\n`;
        code += componentBody;
        code += '\n});\n';
      }
    } else if (features.memo) {
      if (type === 'arrow') {
        code += `const ${name} = memo((${propsParam}) => {\n`;
        if (propsDestructure) code += `  ${propsDestructure}\n\n`;
        code += componentBody;
        code += '\n});\n';
      } else {
        code += `const ${name} = memo(function ${name}(${propsParam}) {\n`;
        if (propsDestructure) code += `  ${propsDestructure}\n\n`;
        code += componentBody;
        code += '\n});\n';
      }
    } else {
      if (type === 'arrow') {
        code += `const ${name} = (${propsParam}) => {\n`;
        if (propsDestructure) code += `  ${propsDestructure}\n\n`;
        code += componentBody;
        code += '\n};\n';
      } else {
        code += `function ${name}(${propsParam}) {\n`;
        if (propsDestructure) code += `  ${propsDestructure}\n\n`;
        code += componentBody;
        code += '\n}\n';
      }
    }

    // Display name for memo/forwardRef
    if (features.memo || features.forwardRef) {
      code += `\n${name}.displayName = '${name}';\n`;
    }

    // Export
    code += `\nexport ${exportType === 'default' ? 'default ' : ''}${exportType === 'default' ? name : `{ ${name} }`};\n`;

    return code;
  }, [config]);

  const generatedTest = useMemo(() => {
    const { name, props, useTypeScript } = config;
    const ext = useTypeScript ? 'tsx' : 'jsx';

    return `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ${name} from './${name}';

describe('${name}', () => {
  const defaultProps${useTypeScript ? `: React.ComponentProps<typeof ${name}>` : ''} = {
${props.filter(p => p.required).map(p => {
      let value = "''";
      if (p.type === 'number') value = '0';
      else if (p.type === 'boolean') value = 'false';
      else if (p.type === 'function') value = 'jest.fn()';
      else if (p.type === 'array') value = '[]';
      else if (p.type === 'object') value = '{}';
      else if (p.type === 'string') value = "'Test'";
      return `    ${p.name}: ${value},`;
    }).join('\n')}
  };

  it('renders without crashing', () => {
    render(<${name} {...defaultProps} />);
  });

  it('renders title correctly', () => {
    render(<${name} {...defaultProps} title="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <${name} {...defaultProps}>
        <span>Child content</span>
      </${name}>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<${name} {...defaultProps} onClick={handleClick} />);

    // Add appropriate click handler test
    // await userEvent.click(screen.getByRole('button'));
    // expect(handleClick).toHaveBeenCalled();
  });
});
`;
  }, [config]);

  const generatedStory = useMemo(() => {
    const { name, props } = config;

    return `import type { Meta, StoryObj } from '@storybook/react';
import ${name} from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
${props.map(p => `    ${p.name}: { control: '${p.type === 'boolean' ? 'boolean' : p.type === 'number' ? 'number' : 'text'}' },`).join('\n')}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
${props.filter(p => p.required).map(p => {
      let value = "''";
      if (p.type === 'number') value = '42';
      else if (p.type === 'boolean') value = 'true';
      else if (p.type === 'string') value = "'Example'";
      return `    ${p.name}: ${value},`;
    }).join('\n')}
  },
};

export const WithChildren: Story = {
  args: {
    ...Default.args,
    children: 'Child content here',
  },
};
`;
  }, [config]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const ext = config.useTypeScript ? 'tsx' : 'jsx';
    const contents = [generatedComponent, generatedTest, generatedStory];
    const names = [`${config.name}.${ext}`, `${config.name}.test.${ext}`, `${config.name}.stories.${ext}`];

    const blob = new Blob([contents[outputTab]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = names[outputTab];
    a.click();
    URL.revokeObjectURL(url);
  };

  const addProp = () => {
    setConfig({
      ...config,
      props: [...config.props, { id: String(Date.now()), name: 'newProp', type: 'string', required: false }],
    });
  };

  const removeProp = (id: string) => {
    setConfig({ ...config, props: config.props.filter(p => p.id !== id) });
  };

  const updateProp = (id: string, updates: Partial<PropDefinition>) => {
    setConfig({ ...config, props: config.props.map(p => p.id === id ? { ...p, ...updates } : p) });
  };

  const addState = () => {
    setConfig({
      ...config,
      states: [...config.states, { id: String(Date.now()), name: 'newState', type: 'string', initialValue: "''" }],
    });
  };

  const removeState = (id: string) => {
    setConfig({ ...config, states: config.states.filter(s => s.id !== id) });
  };

  const updateState = (id: string, updates: Partial<StateDefinition>) => {
    setConfig({ ...config, states: config.states.map(s => s.id === id ? { ...s, ...updates } : s) });
  };

  const outputs = [
    { label: 'Component', content: generatedComponent },
    { label: 'Test', content: generatedTest },
    { label: 'Story', content: generatedStory },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>React Component Generator</Typography>
            <Chip label="React" size="small" color="info" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy"><IconButton onClick={() => handleCopy(outputs[outputTab].content)} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Component Settings */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Component Settings</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField size="small" label="Component Name" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                <Select value={config.type} label="Type" onChange={(e) => setConfig({ ...config, type: e.target.value as ComponentConfig['type'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="arrow">Arrow Function</MenuItem>
                  <MenuItem value="functional">Function Declaration</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Export</InputLabel>
                <Select value={config.exportType} label="Export" onChange={(e) => setConfig({ ...config, exportType: e.target.value as ComponentConfig['exportType'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="named">Named</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel control={<Switch checked={config.useTypeScript} onChange={(e) => setConfig({ ...config, useTypeScript: e.target.checked })} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>TypeScript</Typography>} />
              <FormControlLabel control={<Switch checked={config.features.memo} onChange={(e) => setConfig({ ...config, features: { ...config.features, memo: e.target.checked } })} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>React.memo</Typography>} />
              <FormControlLabel control={<Switch checked={config.features.forwardRef} onChange={(e) => setConfig({ ...config, features: { ...config.features, forwardRef: e.target.checked } })} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>forwardRef</Typography>} />
            </Box>
          </Paper>

          {/* Styling */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Styling</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Tailwind CSS" color={config.features.tailwind ? 'primary' : 'default'} onClick={() => setConfig({ ...config, features: { ...config.features, tailwind: true, cssModule: false, styledComponents: false } })} sx={{ cursor: 'pointer' }} />
              <Chip label="CSS Modules" color={config.features.cssModule ? 'primary' : 'default'} onClick={() => setConfig({ ...config, features: { ...config.features, cssModule: true, tailwind: false, styledComponents: false } })} sx={{ cursor: 'pointer' }} />
              <Chip label="Styled Components" color={config.features.styledComponents ? 'primary' : 'default'} onClick={() => setConfig({ ...config, features: { ...config.features, styledComponents: true, tailwind: false, cssModule: false } })} sx={{ cursor: 'pointer' }} />
              <Chip label="Plain CSS" color={!config.features.tailwind && !config.features.cssModule && !config.features.styledComponents ? 'primary' : 'default'} onClick={() => setConfig({ ...config, features: { ...config.features, tailwind: false, cssModule: false, styledComponents: false } })} sx={{ cursor: 'pointer' }} />
            </Box>
          </Paper>

          {/* Hooks */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Hooks</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(config.hooks).map(([hook, enabled]) => (
                <FormControlLabel
                  key={hook}
                  control={<Switch checked={enabled} onChange={(e) => setConfig({ ...config, hooks: { ...config.hooks, [hook]: e.target.checked } })} size="small" />}
                  label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>{hook}</Typography>}
                />
              ))}
            </Box>
          </Paper>

          {/* Props */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Props</Typography>
              <Button startIcon={<Add />} onClick={addProp} size="small" sx={{ color: 'grey.400' }}>Add Prop</Button>
            </Box>
            {config.props.map(prop => (
              <Box key={prop.id} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                <TextField size="small" label="Name" value={prop.name} onChange={(e) => updateProp(prop.id, { name: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                  <Select value={prop.type} label="Type" onChange={(e) => updateProp(prop.id, { type: e.target.value })} sx={{ color: 'grey.300' }}>
                    {PROP_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControlLabel control={<Switch checked={prop.required} onChange={(e) => updateProp(prop.id, { required: e.target.checked })} size="small" />} label={<Typography sx={{ color: 'grey.400', fontSize: 11 }}>Required</Typography>} />
                <IconButton size="small" onClick={() => removeProp(prop.id)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
              </Box>
            ))}
          </Paper>

          {/* State */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>State</Typography>
              <Button startIcon={<Add />} onClick={addState} size="small" sx={{ color: 'grey.400' }}>Add State</Button>
            </Box>
            {config.states.map(state => (
              <Box key={state.id} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                <TextField size="small" label="Name" value={state.name} onChange={(e) => updateState(state.id, { name: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <TextField size="small" label="Type" value={state.type} onChange={(e) => updateState(state.id, { type: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <TextField size="small" label="Initial Value" value={state.initialValue} onChange={(e) => updateState(state.id, { initialValue: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                <IconButton size="small" onClick={() => removeState(state.id)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
              </Box>
            ))}
          </Paper>
        </Box>

        {/* Output Panel */}
        <Box sx={{ width: 550, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: '1px solid #222' }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)}>
              {outputs.map((out, i) => (
                <Tab key={i} label={out.label} sx={{ color: 'grey.400', fontSize: 12 }} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {outputs[outputTab].content}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
