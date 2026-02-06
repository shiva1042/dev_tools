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
} from '@mui/material';
import {
  ContentCopy,
  Home,
  Add,
  Delete,
  Download,
  SwapHoriz,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  expression?: string;
  ignore: boolean;
  qualifiedByName?: string;
}

interface MapperConfig {
  mapperName: string;
  packageName: string;
  sourceClass: string;
  targetClass: string;
  componentModel: 'default' | 'spring' | 'cdi' | 'jsr330';
  unmappedTargetPolicy: 'ERROR' | 'WARN' | 'IGNORE';
  unmappedSourcePolicy: 'ERROR' | 'WARN' | 'IGNORE';
  nullValueMappingStrategy: 'RETURN_NULL' | 'RETURN_DEFAULT';
  fieldMappings: FieldMapping[];
  usesMappers: string[];
  generateInverse: boolean;
  generateUpdateMethod: boolean;
}

export default function MapStructGenerator() {
  const [config, setConfig] = useState<MapperConfig>({
    mapperName: 'UserMapper',
    packageName: 'com.example.mapper',
    sourceClass: 'User',
    targetClass: 'UserDTO',
    componentModel: 'spring',
    unmappedTargetPolicy: 'WARN',
    unmappedSourcePolicy: 'IGNORE',
    nullValueMappingStrategy: 'RETURN_NULL',
    fieldMappings: [
      { id: '1', sourceField: 'id', targetField: 'id', ignore: false },
      { id: '2', sourceField: 'firstName', targetField: 'firstName', ignore: false },
      { id: '3', sourceField: 'lastName', targetField: 'lastName', ignore: false },
      { id: '4', sourceField: 'email', targetField: 'emailAddress', ignore: false },
      { id: '5', sourceField: 'createdAt', targetField: 'createdDate', expression: "java(source.getCreatedAt().toString())", ignore: false },
      { id: '6', sourceField: 'password', targetField: 'password', ignore: true },
    ],
    usesMappers: [],
    generateInverse: true,
    generateUpdateMethod: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const generatedMapper = useMemo(() => {
    const {
      mapperName, packageName, sourceClass, targetClass, componentModel,
      unmappedTargetPolicy, unmappedSourcePolicy, nullValueMappingStrategy,
      fieldMappings, usesMappers, generateInverse, generateUpdateMethod
    } = config;

    let code = `package ${packageName};\n\n`;

    // Imports
    code += `import org.mapstruct.*;\n`;
    if (componentModel === 'spring') {
      code += `import org.springframework.stereotype.Component;\n`;
    }
    code += `import java.util.List;\n\n`;

    // Mapper annotation
    const mapperParams: string[] = [];
    if (componentModel !== 'default') {
      mapperParams.push(`componentModel = "${componentModel}"`);
    }
    mapperParams.push(`unmappedTargetPolicy = ReportingPolicy.${unmappedTargetPolicy}`);
    mapperParams.push(`unmappedSourcePolicy = ReportingPolicy.${unmappedSourcePolicy}`);
    mapperParams.push(`nullValueMappingStrategy = NullValueMappingStrategy.${nullValueMappingStrategy}`);

    if (usesMappers.length > 0) {
      mapperParams.push(`uses = {${usesMappers.map(m => `${m}.class`).join(', ')}}`);
    }

    code += `@Mapper(${mapperParams.join(',\n        ')})\n`;
    code += `public interface ${mapperName} {\n\n`;

    // Main mapping method
    const mappingsWithCustom = fieldMappings.filter(m => m.sourceField !== m.targetField || m.ignore || m.expression || m.qualifiedByName);

    if (mappingsWithCustom.length > 0) {
      code += '    @Mappings({\n';
      const mappingAnnotations = mappingsWithCustom.map(m => {
        const params: string[] = [];
        params.push(`source = "${m.sourceField}"`);
        params.push(`target = "${m.targetField}"`);
        if (m.ignore) params.push('ignore = true');
        if (m.expression) params.push(`expression = "${m.expression}"`);
        if (m.qualifiedByName) params.push(`qualifiedByName = "${m.qualifiedByName}"`);
        return `        @Mapping(${params.join(', ')})`;
      });
      code += mappingAnnotations.join(',\n');
      code += '\n    })\n';
    }
    code += `    ${targetClass} toDto(${sourceClass} source);\n\n`;

    // List mapping
    code += `    List<${targetClass}> toDtoList(List<${sourceClass}> sources);\n\n`;

    // Inverse mapping (DTO to Entity)
    if (generateInverse) {
      if (mappingsWithCustom.length > 0) {
        code += '    @Mappings({\n';
        const inverseMappings = mappingsWithCustom.map(m => {
          const params: string[] = [];
          params.push(`source = "${m.targetField}"`);
          params.push(`target = "${m.sourceField}"`);
          if (m.ignore) params.push('ignore = true');
          // Note: expressions might need to be different for inverse
          return `        @Mapping(${params.join(', ')})`;
        });
        code += inverseMappings.join(',\n');
        code += '\n    })\n';
      }
      code += `    ${sourceClass} toEntity(${targetClass} dto);\n\n`;
      code += `    List<${sourceClass}> toEntityList(List<${targetClass}> dtos);\n\n`;
    }

    // Update method
    if (generateUpdateMethod) {
      code += `    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)\n`;
      if (mappingsWithCustom.length > 0) {
        code += '    @Mappings({\n';
        const updateMappings = mappingsWithCustom.filter(m => !m.expression).map(m => {
          const params: string[] = [];
          params.push(`source = "${m.targetField}"`);
          params.push(`target = "${m.sourceField}"`);
          if (m.ignore) params.push('ignore = true');
          return `        @Mapping(${params.join(', ')})`;
        });
        code += updateMappings.join(',\n');
        code += '\n    })\n';
      }
      code += `    void updateEntityFromDto(${targetClass} dto, @MappingTarget ${sourceClass} entity);\n\n`;
    }

    // Custom mapping methods placeholder
    code += `    // Custom mapping methods can be added here using @Named annotation\n`;
    code += `    // @Named("customMethod")\n`;
    code += `    // default String customMapping(SomeType source) { ... }\n`;

    code += `}\n`;

    return code;
  }, [config]);

  const generatedMavenDependency = `<!-- MapStruct Dependencies -->
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>

<!-- MapStruct Processor (add to annotationProcessorPaths in maven-compiler-plugin) -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.5.5.Final</version>
            </path>
            <!-- If using Lombok, add lombok-mapstruct-binding -->
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok-mapstruct-binding</artifactId>
                <version>0.2.0</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>`;

  const generatedGradleDependency = `// MapStruct Dependencies
implementation 'org.mapstruct:mapstruct:1.5.5.Final'
annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'

// If using Lombok, add lombok-mapstruct-binding
annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'`;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedMapper], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.mapperName}.java`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addMapping = () => {
    setConfig({
      ...config,
      fieldMappings: [...config.fieldMappings, {
        id: String(Date.now()),
        sourceField: 'sourceField',
        targetField: 'targetField',
        ignore: false,
      }],
    });
  };

  const removeMapping = (id: string) => {
    setConfig({ ...config, fieldMappings: config.fieldMappings.filter(m => m.id !== id) });
  };

  const updateMapping = (id: string, updates: Partial<FieldMapping>) => {
    setConfig({
      ...config,
      fieldMappings: config.fieldMappings.map(m => m.id === id ? { ...m, ...updates } : m),
    });
  };

  const swapFields = (id: string) => {
    setConfig({
      ...config,
      fieldMappings: config.fieldMappings.map(m =>
        m.id === id ? { ...m, sourceField: m.targetField, targetField: m.sourceField } : m
      ),
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>MapStruct Mapper Generator</Typography>
            <Chip label="Java" size="small" color="warning" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy"><IconButton onClick={() => handleCopy(generatedMapper)} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Mapper Settings */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Mapper Configuration</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField size="small" label="Mapper Name" value={config.mapperName} onChange={(e) => setConfig({ ...config, mapperName: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              <TextField size="small" label="Package" value={config.packageName} onChange={(e) => setConfig({ ...config, packageName: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField size="small" label="Source Class (Entity)" value={config.sourceClass} onChange={(e) => setConfig({ ...config, sourceClass: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              <TextField size="small" label="Target Class (DTO)" value={config.targetClass} onChange={(e) => setConfig({ ...config, targetClass: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Component Model</InputLabel>
                <Select value={config.componentModel} label="Component Model" onChange={(e) => setConfig({ ...config, componentModel: e.target.value as MapperConfig['componentModel'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="spring">Spring</MenuItem>
                  <MenuItem value="cdi">CDI</MenuItem>
                  <MenuItem value="jsr330">JSR-330</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Unmapped Target</InputLabel>
                <Select value={config.unmappedTargetPolicy} label="Unmapped Target" onChange={(e) => setConfig({ ...config, unmappedTargetPolicy: e.target.value as MapperConfig['unmappedTargetPolicy'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="ERROR">ERROR</MenuItem>
                  <MenuItem value="WARN">WARN</MenuItem>
                  <MenuItem value="IGNORE">IGNORE</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: 'grey.500' }}>Null Value</InputLabel>
                <Select value={config.nullValueMappingStrategy} label="Null Value" onChange={(e) => setConfig({ ...config, nullValueMappingStrategy: e.target.value as MapperConfig['nullValueMappingStrategy'] })} sx={{ color: 'grey.300' }}>
                  <MenuItem value="RETURN_NULL">RETURN_NULL</MenuItem>
                  <MenuItem value="RETURN_DEFAULT">RETURN_DEFAULT</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControlLabel
                control={<Switch checked={config.generateInverse} onChange={(e) => setConfig({ ...config, generateInverse: e.target.checked })} size="small" />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>Generate Inverse (toEntity)</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={config.generateUpdateMethod} onChange={(e) => setConfig({ ...config, generateUpdateMethod: e.target.checked })} size="small" />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>Generate Update Method</Typography>}
              />
            </Box>
          </Paper>

          {/* Field Mappings */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Field Mappings</Typography>
              <Button startIcon={<Add />} onClick={addMapping} size="small" sx={{ color: 'grey.400' }}>Add Mapping</Button>
            </Box>

            {config.fieldMappings.map(mapping => (
              <Paper key={mapping.id} sx={{ bgcolor: '#0a0a0a', border: '1px solid #333', p: 2, mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                  <TextField
                    size="small"
                    label={`Source (${config.sourceClass})`}
                    value={mapping.sourceField}
                    onChange={(e) => updateMapping(mapping.id, { sourceField: e.target.value })}
                    sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
                  />
                  <Tooltip title="Swap fields">
                    <IconButton size="small" onClick={() => swapFields(mapping.id)} sx={{ color: 'grey.500' }}>
                      <SwapHoriz />
                    </IconButton>
                  </Tooltip>
                  <TextField
                    size="small"
                    label={`Target (${config.targetClass})`}
                    value={mapping.targetField}
                    onChange={(e) => updateMapping(mapping.id, { targetField: e.target.value })}
                    sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }}
                  />
                  <FormControlLabel
                    control={<Switch checked={mapping.ignore} onChange={(e) => updateMapping(mapping.id, { ignore: e.target.checked })} size="small" />}
                    label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>Ignore</Typography>}
                  />
                  <IconButton size="small" onClick={() => removeMapping(mapping.id)} sx={{ color: 'grey.500' }}>
                    <Delete />
                  </IconButton>
                </Box>
                <TextField
                  size="small"
                  label="Expression (optional)"
                  value={mapping.expression || ''}
                  onChange={(e) => updateMapping(mapping.id, { expression: e.target.value || undefined })}
                  placeholder='java(source.getField().toString())'
                  fullWidth
                  sx={{ '& .MuiInputBase-root': { color: 'grey.300', fontFamily: 'monospace', fontSize: 12 } }}
                />
              </Paper>
            ))}
          </Paper>

          {/* Dependency Info */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Dependencies</Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>Maven</Typography>
                <IconButton size="small" onClick={() => handleCopy(generatedMavenDependency)} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              <Paper sx={{ bgcolor: '#0a0a0a', p: 1, border: '1px solid #333' }}>
                <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 10, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                  {generatedMavenDependency}
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>Gradle</Typography>
                <IconButton size="small" onClick={() => handleCopy(generatedGradleDependency)} sx={{ color: 'grey.500' }}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              <Paper sx={{ bgcolor: '#0a0a0a', p: 1, border: '1px solid #333' }}>
                <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 10, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                  {generatedGradleDependency}
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Box>

        {/* Output Panel */}
        <Box sx={{ width: 550, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>{config.mapperName}.java</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {generatedMapper}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
