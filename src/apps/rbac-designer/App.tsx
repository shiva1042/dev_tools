import { useState, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Tabs, Tab,
  Chip, Snackbar, Checkbox, Select, MenuItem, FormControl, InputLabel, Divider,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Role { id: string; name: string; parentId: string | null; }

export default function App() {
  const [roles, setRoles] = useState<Role[]>([
    { id: 'r1', name: 'Admin', parentId: null },
    { id: 'r2', name: 'Editor', parentId: 'r1' },
    { id: 'r3', name: 'Viewer', parentId: 'r2' },
  ]);
  const [permissions, setPermissions] = useState<string[]>(['users:read', 'users:write', 'users:delete', 'posts:read', 'posts:create', 'posts:delete', 'settings:read', 'settings:write']);
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({
    r1: new Set(['users:read', 'users:write', 'users:delete', 'posts:read', 'posts:create', 'posts:delete', 'settings:read', 'settings:write']),
    r2: new Set(['users:read', 'posts:read', 'posts:create', 'posts:delete']),
    r3: new Set(['users:read', 'posts:read']),
  });
  const [newRole, setNewRole] = useState('');
  const [newPerm, setNewPerm] = useState('');
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');

  const uid = () => 'r' + Math.random().toString(36).slice(2, 8);
  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const addRole = () => {
    if (!newRole.trim()) return;
    const id = uid();
    setRoles(prev => [...prev, { id, name: newRole.trim(), parentId: null }]);
    setMatrix(prev => ({ ...prev, [id]: new Set<string>() }));
    setNewRole('');
  };

  const removeRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id).map(r => r.parentId === id ? { ...r, parentId: null } : r));
    setMatrix(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const addPerm = () => {
    if (!newPerm.trim() || permissions.includes(newPerm.trim())) return;
    setPermissions(prev => [...prev, newPerm.trim()]);
    setNewPerm('');
  };

  const removePerm = (p: string) => {
    setPermissions(prev => prev.filter(x => x !== p));
    setMatrix(prev => {
      const n: Record<string, Set<string>> = {};
      Object.entries(prev).forEach(([k, v]) => { const s = new Set(v); s.delete(p); n[k] = s; });
      return n;
    });
  };

  const togglePerm = (roleId: string, perm: string) => {
    setMatrix(prev => {
      const s = new Set(prev[roleId] || []);
      if (s.has(perm)) s.delete(perm); else s.add(perm);
      return { ...prev, [roleId]: s };
    });
  };

  const getEffective = useCallback((roleId: string): Set<string> => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return new Set();
    const own = matrix[roleId] || new Set();
    if (role.parentId) {
      const parent = getEffective(role.parentId);
      return new Set([...own, ...parent]);
    }
    return new Set(own);
  }, [roles, matrix]);

  const setParent = (roleId: string, parentId: string | null) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, parentId } : r));
  };

  const outputs = useMemo(() => {
    const roleData = roles.map(r => ({
      name: r.name,
      inherits: r.parentId ? roles.find(x => x.id === r.parentId)?.name || null : null,
      permissions: Array.from(matrix[r.id] || []),
      effectivePermissions: Array.from(getEffective(r.id)),
    }));

    const json = JSON.stringify({ roles: roleData }, null, 2);

    const yaml = `roles:\n${roleData.map(r => `  - name: "${r.name}"\n    ${r.inherits ? `inherits: "${r.inherits}"\n    ` : ''}permissions:\n${r.permissions.map(p => `      - "${p}"`).join('\n')}`).join('\n')}`;

    const sql = `-- RBAC Schema
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES roles(id)
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) UNIQUE NOT NULL
);

CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Insert permissions
${permissions.map((p, i) => `INSERT INTO permissions (id, name) VALUES (${i + 1}, '${p}');`).join('\n')}

-- Insert roles
${roles.map((r, i) => `INSERT INTO roles (id, name, parent_id) VALUES (${i + 1}, '${r.name}', ${r.parentId ? roles.findIndex(x => x.id === r.parentId) + 1 : 'NULL'});`).join('\n')}

-- Assign permissions
${roles.flatMap((r, ri) => Array.from(matrix[r.id] || []).map(p => `INSERT INTO role_permissions (role_id, permission_id) VALUES (${ri + 1}, ${permissions.indexOf(p) + 1});`)).join('\n')}`;

    const spring = `// Spring Security RBAC Configuration
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class RbacConfig {

${roleData.map(r => `    public static final String ROLE_${r.name.toUpperCase()} = "${r.name}";`).join('\n')}

    @Bean
    public RoleHierarchy roleHierarchy() {
        RoleHierarchyImpl hierarchy = new RoleHierarchyImpl();
        hierarchy.setHierarchy(
${roles.filter(r => r.parentId).map(r => `            "ROLE_${(roles.find(x => x.id === r.parentId)?.name || '').toUpperCase()} > ROLE_${r.name.toUpperCase()}"`).join(' + \"\\n\" +\n')}
        );
        return hierarchy;
    }
}`;

    const casbin = `# Casbin RBAC Policy
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act

# Policies
${roles.flatMap(r => Array.from(matrix[r.id] || []).map(p => { const [res, act] = p.split(':'); return `p, ${r.name}, ${res}, ${act}`; })).join('\n')}

# Role inheritance
${roles.filter(r => r.parentId).map(r => `g, ${(roles.find(x => x.id === r.parentId)?.name || '')}, ${r.name}`).join('\n')}`;

    const node = `// Node.js RBAC Middleware
const roles = ${JSON.stringify(roleData.reduce((acc, r) => ({ ...acc, [r.name]: { permissions: r.permissions, inherits: r.inherits } }), {}), null, 2)};

function getEffectivePermissions(roleName) {
  const role = roles[roleName];
  if (!role) return new Set();
  const perms = new Set(role.permissions);
  if (role.inherits) {
    getEffectivePermissions(role.inherits).forEach(p => perms.add(p));
  }
  return perms;
}

function requirePermission(permission) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) return res.status(401).json({ error: 'Unauthorized' });
    const perms = getEffectivePermissions(userRole);
    if (!perms.has(permission)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// Usage:
// app.get('/users', requirePermission('users:read'), listUsers);
// app.delete('/posts/:id', requirePermission('posts:delete'), deletePost);`;

    return [json, yaml, sql, spring, casbin, node];
  }, [roles, permissions, matrix, getEffective]);

  const tabLabels = ['JSON', 'YAML', 'SQL', 'Spring Security', 'Casbin', 'Node.js Middleware'];
  const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>RBAC Designer</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, minWidth: 280 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Roles</Typography>
            {roles.map(r => (
              <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={r.name} size="small" sx={{ bgcolor: '#1a2332', color: '#90caf9', minWidth: 80 }} />
                <FormControl size="small" sx={{ minWidth: 120, ...sxField }}>
                  <Select displayEmpty value={r.parentId || ''} onChange={e => setParent(r.id, e.target.value || null)} sx={{ color: 'grey.400', fontSize: 12 }}>
                    <MenuItem value=""><em>No parent</em></MenuItem>
                    {roles.filter(x => x.id !== r.id).map(x => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <IconButton size="small" onClick={() => removeRole(r.id)} sx={{ color: 'grey.600' }}><Delete fontSize="small" /></IconButton>
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField size="small" placeholder="Role name" value={newRole} onChange={e => setNewRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRole()} sx={{ flex: 1, ...sxField }} />
              <IconButton size="small" onClick={addRole} sx={{ color: 'grey.400' }}><Add /></IconButton>
            </Box>
          </Paper>

          <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1, minWidth: 280 }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Permissions</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {permissions.map(p => <Chip key={p} label={p} size="small" onDelete={() => removePerm(p)} sx={{ bgcolor: '#1a1a2e', color: '#ce93d8', '& .MuiChip-deleteIcon': { color: '#8e6aab' }, fontFamily: 'monospace', fontSize: 11 }} />)}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" placeholder="resource:action" value={newPerm} onChange={e => setNewPerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPerm()} sx={{ flex: 1, ...sxField }} />
              <IconButton size="small" onClick={addPerm} sx={{ color: 'grey.400' }}><Add /></IconButton>
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 3, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Permission Matrix</Typography>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& th, & td': { border: '1px solid #222', p: 0.5, textAlign: 'center', fontSize: 12 }, '& th': { color: 'grey.500', bgcolor: '#0d0d0d' } }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', minWidth: 100 }}>Role</th>
                {permissions.map(p => <th key={p} style={{ fontFamily: 'monospace', writingMode: 'vertical-rl', height: 100, whiteSpace: 'nowrap', fontSize: 11 }}>{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {roles.map(r => {
                const effective = getEffective(r.id);
                return (
                  <tr key={r.id}>
                    <td style={{ textAlign: 'left', color: '#90caf9', fontWeight: 600 }}>{r.name}</td>
                    {permissions.map(p => {
                      const direct = (matrix[r.id] || new Set()).has(p);
                      const inherited = !direct && effective.has(p);
                      return (
                        <td key={p} style={{ cursor: 'pointer', backgroundColor: direct ? '#1a2332' : inherited ? '#1a1a2e' : undefined }} onClick={() => togglePerm(r.id, p)}>
                          <Checkbox checked={direct} size="small" sx={{ p: 0, color: inherited ? '#7b1fa2' : 'grey.700', '&.Mui-checked': { color: '#1976d2' } }} onChange={() => togglePerm(r.id, p)} />
                          {inherited && <Typography variant="caption" sx={{ color: '#7b1fa2', display: 'block', fontSize: 9 }}>inherited</Typography>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Box>
        </Paper>

        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ '& .MuiTab-root': { color: 'grey.500', fontSize: 12, textTransform: 'none' }, '& .Mui-selected': { color: '#90caf9' } }}>
              {tabLabels.map(l => <Tab key={l} label={l} />)}
            </Tabs>
            <Tooltip title="Copy"><IconButton onClick={() => copy(outputs[tab])} sx={{ color: 'grey.400' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
          <Box component="pre" sx={{ color: '#81c784', fontFamily: 'monospace', fontSize: 12, overflow: 'auto', maxHeight: 500, whiteSpace: 'pre-wrap', m: 0, mt: 1 }}>{outputs[tab]}</Box>
        </Paper>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
