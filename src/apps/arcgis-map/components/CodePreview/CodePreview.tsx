import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Editor from '@monaco-editor/react';
import '@/utils/monacoConfig'; // Enable offline Monaco support
import { useMapStore } from '../../store/mapStore';
import {
  generateMapComponent,
  generateAppComponent,
  generateConfigJson,
  generateJSWrapperCode,
} from '../../generators/codeGenerator';
import type { MapState } from '../../types';

interface TabConfig {
  label: string;
  language: string;
  generator: (state: MapState) => string;
}

const tabs: TabConfig[] = [
  { label: 'ArcGISMap.tsx', language: 'typescript', generator: generateMapComponent },
  { label: 'App.tsx', language: 'typescript', generator: generateAppComponent },
  { label: 'MapApp.js (AMD)', language: 'javascript', generator: generateJSWrapperCode },
  { label: 'config.json', language: 'json', generator: generateConfigJson },
];

export default function CodePreview() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // Select individual state slices to avoid infinite loop
  const map = useMapStore((s) => s.map);
  const layers = useMapStore((s) => s.layers);
  const widgets = useMapStore((s) => s.widgets);
  const graphics = useMapStore((s) => s.graphics);
  const popupTemplates = useMapStore((s) => s.popupTemplates);
  const jsonDataLayers = useMapStore((s) => s.jsonDataLayers);

  // Memoize the state object
  const state = useMemo<MapState>(
    () => ({ map, layers, widgets, graphics, popupTemplates, jsonDataLayers }),
    [map, layers, widgets, graphics, popupTemplates, jsonDataLayers]
  );

  const code = useMemo(() => {
    const tab = tabs[activeTab];
    return tab.generator(state);
  }, [activeTab, state]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          bgcolor: '#1e1e1e',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0,
              px: 2,
              fontSize: 12,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
        <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
          <IconButton size="small" onClick={handleCopy} sx={{ mr: 1 }}>
            {copied ? (
              <CheckIcon fontSize="small" color="success" />
            ) : (
              <ContentCopyIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={tabs[activeTab].language}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 8 },
          }}
        />
      </Box>
    </Box>
  );
}
