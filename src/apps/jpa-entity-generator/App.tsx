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

interface Field {
  id: string;
  name: string;
  type: string;
  columnName?: string;
  nullable: boolean;
  unique: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  isId: boolean;
  generationType?: string;
  relationshipType?: string;
  targetEntity?: string;
  mappedBy?: string;
  fetchType?: string;
  cascadeTypes?: string[];
}

interface EntityConfig {
  className: string;
  tableName: string;
  packageName: string;
  useLombok: boolean;
  useAuditing: boolean;
  fields: Field[];
}

const JAVA_TYPES = [
  'String', 'Long', 'Integer', 'Double', 'Float', 'Boolean', 'BigDecimal',
  'LocalDate', 'LocalDateTime', 'Instant', 'UUID', 'byte[]', 'Enum',
];

const GENERATION_TYPES = ['IDENTITY', 'SEQUENCE', 'TABLE', 'AUTO', 'UUID'];
const RELATIONSHIP_TYPES = ['OneToOne', 'OneToMany', 'ManyToOne', 'ManyToMany'];
const FETCH_TYPES = ['LAZY', 'EAGER'];
const CASCADE_TYPES = ['ALL', 'PERSIST', 'MERGE', 'REMOVE', 'REFRESH', 'DETACH'];

export default function JpaEntityGenerator() {
  const [outputTab, setOutputTab] = useState(0);
  const [entity, setEntity] = useState<EntityConfig>({
    className: 'User',
    tableName: 'users',
    packageName: 'com.example.entity',
    useLombok: true,
    useAuditing: true,
    fields: [
      { id: '1', name: 'id', type: 'Long', isId: true, nullable: false, unique: true, generationType: 'IDENTITY' },
      { id: '2', name: 'username', type: 'String', isId: false, nullable: false, unique: true, length: 50 },
      { id: '3', name: 'email', type: 'String', isId: false, nullable: false, unique: true, length: 100 },
      { id: '4', name: 'password', type: 'String', isId: false, nullable: false, unique: false, length: 255 },
      { id: '5', name: 'active', type: 'Boolean', isId: false, nullable: false, unique: false },
      { id: '6', name: 'createdAt', type: 'LocalDateTime', columnName: 'created_at', isId: false, nullable: false, unique: false },
    ],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const generatedEntity = useMemo(() => {
    const imports = new Set<string>();
    imports.add('jakarta.persistence.*');

    if (entity.useLombok) {
      imports.add('lombok.Data');
      imports.add('lombok.NoArgsConstructor');
      imports.add('lombok.AllArgsConstructor');
      imports.add('lombok.Builder');
    }

    if (entity.useAuditing) {
      imports.add('org.springframework.data.annotation.CreatedDate');
      imports.add('org.springframework.data.annotation.LastModifiedDate');
      imports.add('org.springframework.data.jpa.domain.support.AuditingEntityListener');
    }

    entity.fields.forEach(field => {
      if (field.type === 'BigDecimal') imports.add('java.math.BigDecimal');
      if (field.type === 'LocalDate') imports.add('java.time.LocalDate');
      if (field.type === 'LocalDateTime') imports.add('java.time.LocalDateTime');
      if (field.type === 'Instant') imports.add('java.time.Instant');
      if (field.type === 'UUID') imports.add('java.util.UUID');
      if (field.relationshipType === 'OneToMany' || field.relationshipType === 'ManyToMany') {
        imports.add('java.util.Set');
        imports.add('java.util.HashSet');
      }
    });

    let code = `package ${entity.packageName};\n\n`;

    Array.from(imports).sort().forEach(imp => {
      code += `import ${imp};\n`;
    });

    code += '\n';

    if (entity.useLombok) {
      code += '@Data\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n';
    }

    code += `@Entity\n@Table(name = "${entity.tableName}")\n`;

    if (entity.useAuditing) {
      code += '@EntityListeners(AuditingEntityListener.class)\n';
    }

    code += `public class ${entity.className} {\n\n`;

    entity.fields.forEach(field => {
      // Annotations
      if (field.isId) {
        code += '    @Id\n';
        if (field.generationType) {
          if (field.generationType === 'UUID') {
            code += '    @GeneratedValue(strategy = GenerationType.UUID)\n';
          } else {
            code += `    @GeneratedValue(strategy = GenerationType.${field.generationType})\n`;
          }
        }
      }

      if (field.relationshipType) {
        let relAnnotation = `    @${field.relationshipType}`;
        const relParams: string[] = [];
        if (field.targetEntity) relParams.push(`targetEntity = ${field.targetEntity}.class`);
        if (field.mappedBy) relParams.push(`mappedBy = "${field.mappedBy}"`);
        if (field.fetchType) relParams.push(`fetch = FetchType.${field.fetchType}`);
        if (field.cascadeTypes && field.cascadeTypes.length > 0) {
          if (field.cascadeTypes.length === 1) {
            relParams.push(`cascade = CascadeType.${field.cascadeTypes[0]}`);
          } else {
            relParams.push(`cascade = {${field.cascadeTypes.map(c => `CascadeType.${c}`).join(', ')}}`);
          }
        }
        if (relParams.length > 0) {
          relAnnotation += `(${relParams.join(', ')})`;
        }
        code += relAnnotation + '\n';

        if (field.relationshipType === 'ManyToOne' || field.relationshipType === 'OneToOne') {
          code += `    @JoinColumn(name = "${field.columnName || field.name + '_id'}")\n`;
        }
      } else {
        // Column annotation
        const columnParams: string[] = [];
        if (field.columnName && field.columnName !== field.name) {
          columnParams.push(`name = "${field.columnName}"`);
        }
        if (!field.nullable) columnParams.push('nullable = false');
        if (field.unique && !field.isId) columnParams.push('unique = true');
        if (field.length && field.type === 'String') columnParams.push(`length = ${field.length}`);
        if (field.precision) columnParams.push(`precision = ${field.precision}`);
        if (field.scale) columnParams.push(`scale = ${field.scale}`);

        if (columnParams.length > 0) {
          code += `    @Column(${columnParams.join(', ')})\n`;
        }
      }

      // Auditing annotations
      if (entity.useAuditing) {
        if (field.name === 'createdAt' || field.name === 'created_at') {
          code += '    @CreatedDate\n';
        }
        if (field.name === 'updatedAt' || field.name === 'updated_at') {
          code += '    @LastModifiedDate\n';
        }
      }

      // Field declaration
      let javaType = field.type;
      if (field.relationshipType === 'OneToMany' || field.relationshipType === 'ManyToMany') {
        javaType = `Set<${field.targetEntity || 'Object'}>`;
      } else if (field.relationshipType === 'ManyToOne' || field.relationshipType === 'OneToOne') {
        javaType = field.targetEntity || 'Object';
      }

      code += `    private ${javaType} ${field.name}`;

      if (field.relationshipType === 'OneToMany' || field.relationshipType === 'ManyToMany') {
        code += ' = new HashSet<>()';
      }

      code += ';\n\n';
    });

    // Generate getters/setters if not using Lombok
    if (!entity.useLombok) {
      entity.fields.forEach(field => {
        const capName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
        let javaType = field.type;
        if (field.relationshipType === 'OneToMany' || field.relationshipType === 'ManyToMany') {
          javaType = `Set<${field.targetEntity || 'Object'}>`;
        } else if (field.relationshipType === 'ManyToOne' || field.relationshipType === 'OneToOne') {
          javaType = field.targetEntity || 'Object';
        }

        code += `    public ${javaType} get${capName}() {\n`;
        code += `        return ${field.name};\n`;
        code += '    }\n\n';

        code += `    public void set${capName}(${javaType} ${field.name}) {\n`;
        code += `        this.${field.name} = ${field.name};\n`;
        code += '    }\n\n';
      });
    }

    code += '}\n';

    return code;
  }, [entity]);

  const generatedRepository = useMemo(() => {
    const idField = entity.fields.find(f => f.isId);
    const idType = idField?.type || 'Long';

    return `package ${entity.packageName.replace('.entity', '.repository')};

import ${entity.packageName}.${entity.className};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ${entity.className}Repository extends JpaRepository<${entity.className}, ${idType}>, JpaSpecificationExecutor<${entity.className}> {

    // Add custom query methods here
    // Example: Optional<${entity.className}> findByEmail(String email);

}
`;
  }, [entity]);

  const generatedDTO = useMemo(() => {
    let code = `package ${entity.packageName.replace('.entity', '.dto')};\n\n`;

    if (entity.useLombok) {
      code += `import lombok.Data;\nimport lombok.Builder;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n\n`;
      code += '@Data\n@Builder\n@NoArgsConstructor\n@AllArgsConstructor\n';
    }

    code += `public class ${entity.className}DTO {\n\n`;

    entity.fields.filter(f => !f.relationshipType).forEach(field => {
      code += `    private ${field.type} ${field.name};\n`;
    });

    if (!entity.useLombok) {
      code += '\n    // Add getters and setters\n';
    }

    code += '\n}\n';
    return code;
  }, [entity]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const outputs = [
      { name: `${entity.className}.java`, content: generatedEntity },
      { name: `${entity.className}Repository.java`, content: generatedRepository },
      { name: `${entity.className}DTO.java`, content: generatedDTO },
    ];
    const content = outputs[outputTab];
    const blob = new Blob([content.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = content.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addField = () => {
    setEntity({
      ...entity,
      fields: [...entity.fields, {
        id: String(Date.now()),
        name: 'newField',
        type: 'String',
        nullable: true,
        unique: false,
        isId: false,
      }],
    });
  };

  const removeField = (id: string) => {
    setEntity({ ...entity, fields: entity.fields.filter(f => f.id !== id) });
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setEntity({
      ...entity,
      fields: entity.fields.map(f => f.id === id ? { ...f, ...updates } : f),
    });
  };

  const outputContent = [generatedEntity, generatedRepository, generatedDTO][outputTab];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>JPA Entity Generator</Typography>
            <Chip label="Spring Boot" size="small" color="success" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy"><IconButton onClick={() => handleCopy(outputContent)} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* Entity Settings */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'grey.300', mb: 2 }}>Entity Configuration</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField size="small" label="Class Name" value={entity.className} onChange={(e) => setEntity({ ...entity, className: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
              <TextField size="small" label="Table Name" value={entity.tableName} onChange={(e) => setEntity({ ...entity, tableName: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
            </Box>
            <TextField size="small" label="Package Name" value={entity.packageName} onChange={(e) => setEntity({ ...entity, packageName: e.target.value })} fullWidth sx={{ mb: 2, '& .MuiInputBase-root': { color: 'grey.300' } }} />
            <Box sx={{ display: 'flex', gap: 3 }}>
              <FormControlLabel
                control={<Switch checked={entity.useLombok} onChange={(e) => setEntity({ ...entity, useLombok: e.target.checked })} size="small" />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>Use Lombok</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={entity.useAuditing} onChange={(e) => setEntity({ ...entity, useAuditing: e.target.checked })} size="small" />}
                label={<Typography sx={{ color: 'grey.400', fontSize: 14 }}>Spring Data Auditing</Typography>}
              />
            </Box>
          </Paper>

          {/* Fields */}
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>Fields</Typography>
              <Button startIcon={<Add />} onClick={addField} size="small" sx={{ color: 'grey.400' }}>Add Field</Button>
            </Box>

            {entity.fields.map(field => (
              <Paper key={field.id} sx={{ bgcolor: '#0a0a0a', border: '1px solid #333', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField size="small" label="Name" value={field.name} onChange={(e) => updateField(field.id, { name: e.target.value })} sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                    <Select value={field.type} label="Type" onChange={(e) => updateField(field.id, { type: e.target.value })} sx={{ color: 'grey.300' }}>
                      {JAVA_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField size="small" label="Column Name" value={field.columnName || ''} onChange={(e) => updateField(field.id, { columnName: e.target.value })} placeholder="optional" sx={{ flex: 1, '& .MuiInputBase-root': { color: 'grey.300' } }} />
                  <IconButton size="small" onClick={() => removeField(field.id)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={<Switch checked={field.isId} onChange={(e) => updateField(field.id, { isId: e.target.checked })} size="small" />}
                    label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>@Id</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={!field.nullable} onChange={(e) => updateField(field.id, { nullable: !e.target.checked })} size="small" />}
                    label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>Required</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch checked={field.unique} onChange={(e) => updateField(field.id, { unique: e.target.checked })} size="small" />}
                    label={<Typography sx={{ color: 'grey.400', fontSize: 12 }}>Unique</Typography>}
                  />

                  {field.isId && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>Generation</InputLabel>
                      <Select value={field.generationType || ''} label="Generation" onChange={(e) => updateField(field.id, { generationType: e.target.value })} sx={{ color: 'grey.300', fontSize: 12 }}>
                        {GENERATION_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}

                  {field.type === 'String' && (
                    <TextField size="small" label="Length" type="number" value={field.length || ''} onChange={(e) => updateField(field.id, { length: parseInt(e.target.value) || undefined })} sx={{ width: 80, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 12 } }} />
                  )}
                </Box>

                {/* Relationship settings */}
                <Box sx={{ mt: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 130, mr: 2 }}>
                    <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>Relationship</InputLabel>
                    <Select value={field.relationshipType || ''} label="Relationship" onChange={(e) => updateField(field.id, { relationshipType: e.target.value || undefined })} sx={{ color: 'grey.300', fontSize: 12 }}>
                      <MenuItem value="">None</MenuItem>
                      {RELATIONSHIP_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>

                  {field.relationshipType && (
                    <>
                      <TextField size="small" label="Target Entity" value={field.targetEntity || ''} onChange={(e) => updateField(field.id, { targetEntity: e.target.value })} sx={{ mr: 1, width: 120, '& .MuiInputBase-root': { color: 'grey.300', fontSize: 12 } }} />
                      <FormControl size="small" sx={{ minWidth: 100, mr: 1 }}>
                        <InputLabel sx={{ color: 'grey.500', fontSize: 12 }}>Fetch</InputLabel>
                        <Select value={field.fetchType || ''} label="Fetch" onChange={(e) => updateField(field.id, { fetchType: e.target.value || undefined })} sx={{ color: 'grey.300', fontSize: 12 }}>
                          {FETCH_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </Paper>
        </Box>

        {/* Output Panel */}
        <Box sx={{ width: 550, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: '1px solid #222' }}>
            <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)}>
              <Tab label="Entity" sx={{ color: 'grey.400', fontSize: 12 }} />
              <Tab label="Repository" sx={{ color: 'grey.400', fontSize: 12 }} />
              <Tab label="DTO" sx={{ color: 'grey.400', fontSize: 12 }} />
            </Tabs>
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre-wrap' }}>
                {outputContent}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
