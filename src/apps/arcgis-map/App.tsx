import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MapIcon from '@mui/icons-material/Map';
import LayersIcon from '@mui/icons-material/Layers';
import WidgetsIcon from '@mui/icons-material/Widgets';
import DrawIcon from '@mui/icons-material/Draw';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

import MapDesigner from './components/MapDesigner/MapDesigner';
import LayerManager from './components/LayerManager/LayerManager';
import JsonLayerBuilder from './components/JsonLayerBuilder/JsonLayerBuilder';
import WidgetBuilder from './components/WidgetBuilder/WidgetBuilder';
import GraphicsBuilder from './components/GraphicsBuilder/GraphicsBuilder';
import PopupBuilder from './components/PopupBuilder/PopupBuilder';
import CodePreview from './components/CodePreview/CodePreview';
import PropertiesPanel from './components/Properties/PropertiesPanel';
import MapPreview from './components/MapPreview/MapPreview';
import ExportDialog from './components/Export/ExportDialog';
import { useMapStore } from './store/mapStore';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 100,
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height: '100%', overflow: 'auto' }}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [leftTab, setLeftTab] = useState(0);
  const [middleTab, setMiddleTab] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const resetState = useMapStore((state) => state.resetState);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Back to Home">
              <IconButton
                component={Link}
                to="/"
                size="small"
                sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
              >
                <HomeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <MapIcon color="primary" />
            <Box
              component="span"
              sx={{ fontSize: 18, fontWeight: 600, color: 'primary.main' }}
            >
              ArcGIS React Builder
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Reset All">
              <IconButton size="small" onClick={resetState}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton size="small" onClick={() => setExportOpen(true)}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel - Map Designer */}
          <Box
            sx={{
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRight: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Tabs
              value={leftTab}
              onChange={(_, v) => setLeftTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Tab icon={<MapIcon fontSize="small" />} label="Map" iconPosition="start" />
              <Tab icon={<DrawIcon fontSize="small" />} label="Draw" iconPosition="start" />
            </Tabs>
            <Box sx={{ flex: 1, overflow: 'auto' }} className="panel-scrollbar">
              <TabPanel value={leftTab} index={0}>
                <MapDesigner />
              </TabPanel>
              <TabPanel value={leftTab} index={1}>
                <GraphicsBuilder />
              </TabPanel>
            </Box>
          </Box>

          {/* Center Panel - Map Preview + Code */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            {/* Map Preview */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MapPreview />
            </Box>

            {/* Code Preview */}
            <Box
              sx={{
                height: 300,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  bgcolor: 'background.paper',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <CodeIcon fontSize="small" color="primary" />
                <Box component="span" sx={{ fontWeight: 500, fontSize: 13 }}>
                  Code Preview
                </Box>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <CodePreview />
              </Box>
            </Box>
          </Box>

          {/* Right Panel - Layers/Widgets/Properties */}
          <Box
            sx={{
              width: 350,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Tabs
              value={middleTab}
              onChange={(_, v) => setMiddleTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Tab icon={<LayersIcon fontSize="small" />} label="Layers" iconPosition="start" />
              <Tab icon={<WidgetsIcon fontSize="small" />} label="Widgets" iconPosition="start" />
              <Tab icon={<InfoIcon fontSize="small" />} label="Popups" iconPosition="start" />
            </Tabs>
            <Box sx={{ flex: 1, overflow: 'auto' }} className="panel-scrollbar">
              <TabPanel value={middleTab} index={0}>
                <LayerManager />
                <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <JsonLayerBuilder />
                </Box>
              </TabPanel>
              <TabPanel value={middleTab} index={1}>
                <WidgetBuilder />
              </TabPanel>
              <TabPanel value={middleTab} index={2}>
                <PopupBuilder />
              </TabPanel>
            </Box>

            {/* Properties Panel */}
            <Box
              sx={{
                height: 250,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                overflow: 'auto',
              }}
              className="panel-scrollbar"
            >
              <PropertiesPanel />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Export Dialog */}
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </ThemeProvider>
  );
}

export default App;
