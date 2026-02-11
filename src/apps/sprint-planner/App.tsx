import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Chip, Divider,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from '@mui/material';
import Home from '@mui/icons-material/Home';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Download from '@mui/icons-material/Download';
import Dashboard from '@mui/icons-material/Dashboard';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Warning from '@mui/icons-material/Warning';

type Priority = 'critical' | 'high' | 'medium' | 'low';
type Status = 'todo' | 'in-progress' | 'done';

const POINT_OPTIONS = [1, 2, 3, 5, 8, 13, 21];
const PRIORITY_COLORS: Record<Priority, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e',
};
const STATUS_COLORS: Record<Status, string> = {
  todo: '#6b7280', 'in-progress': '#3b82f6', done: '#22c55e',
};

interface TeamMember {
  id: number;
  name: string;
  capacity: number;
}

interface Story {
  id: number;
  title: string;
  description: string;
  points: number;
  priority: Priority;
  assignee: string;
  status: Status;
}

interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  members: TeamMember[];
  stories: Story[];
}

export default function App() {
  const [sprints, setSprints] = useState<Sprint[]>([
    {
      id: 1, name: 'Sprint 1',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      capacity: 40, members: [], stories: [],
    },
  ]);
  const [activeSprintId, setActiveSprintId] = useState(1);
  const [snackbar, setSnackbar] = useState('');
  const [nextId, setNextId] = useState(2);
  const [nextMemberId, setNextMemberId] = useState(1);
  const [nextStoryId, setNextStoryId] = useState(1);

  // New story form
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDesc, setStoryDesc] = useState('');
  const [storyPoints, setStoryPoints] = useState(3);
  const [storyPriority, setStoryPriority] = useState<Priority>('medium');
  const [storyAssignee, setStoryAssignee] = useState('');

  // New member form
  const [memberName, setMemberName] = useState('');
  const [memberCapacity, setMemberCapacity] = useState(8);

  const activeSprint = useMemo(() => sprints.find((s) => s.id === activeSprintId), [sprints, activeSprintId]);

  const updateSprint = (id: number, updates: Partial<Sprint>) => {
    setSprints(sprints.map((s) => s.id === id ? { ...s, ...updates } : s));
  };

  const addSprint = () => {
    const ns: Sprint = {
      id: nextId, name: `Sprint ${nextId}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      capacity: 40, members: [], stories: [],
    };
    setSprints([...sprints, ns]);
    setNextId(nextId + 1);
    setActiveSprintId(ns.id);
  };

  const removeSprint = (id: number) => {
    const remaining = sprints.filter((s) => s.id !== id);
    setSprints(remaining);
    if (activeSprintId === id && remaining.length > 0) setActiveSprintId(remaining[0].id);
  };

  const addMember = () => {
    if (!memberName.trim() || !activeSprint) return;
    const member: TeamMember = { id: nextMemberId, name: memberName.trim(), capacity: memberCapacity };
    updateSprint(activeSprint.id, {
      members: [...activeSprint.members, member],
      capacity: activeSprint.capacity + memberCapacity,
    });
    setNextMemberId(nextMemberId + 1);
    setMemberName('');
  };

  const removeMember = (memberId: number) => {
    if (!activeSprint) return;
    const member = activeSprint.members.find((m) => m.id === memberId);
    updateSprint(activeSprint.id, {
      members: activeSprint.members.filter((m) => m.id !== memberId),
      capacity: Math.max(0, activeSprint.capacity - (member?.capacity || 0)),
    });
  };

  const addStory = () => {
    if (!storyTitle.trim() || !activeSprint) return;
    const story: Story = {
      id: nextStoryId, title: storyTitle.trim(), description: storyDesc,
      points: storyPoints, priority: storyPriority, assignee: storyAssignee, status: 'todo',
    };
    updateSprint(activeSprint.id, { stories: [...activeSprint.stories, story] });
    setNextStoryId(nextStoryId + 1);
    setStoryTitle('');
    setStoryDesc('');
    setStoryAssignee('');
  };

  const removeStory = (storyId: number) => {
    if (!activeSprint) return;
    updateSprint(activeSprint.id, { stories: activeSprint.stories.filter((s) => s.id !== storyId) });
  };

  const updateStoryStatus = (storyId: number, status: Status) => {
    if (!activeSprint) return;
    updateSprint(activeSprint.id, {
      stories: activeSprint.stories.map((s) => s.id === storyId ? { ...s, status } : s),
    });
  };

  const updateStoryAssignee = (storyId: number, assignee: string) => {
    if (!activeSprint) return;
    updateSprint(activeSprint.id, {
      stories: activeSprint.stories.map((s) => s.id === storyId ? { ...s, assignee } : s),
    });
  };

  // Computed stats
  const totalPoints = activeSprint?.stories.reduce((s, st) => s + st.points, 0) || 0;
  const donePoints = activeSprint?.stories.filter((s) => s.status === 'done').reduce((s, st) => s + st.points, 0) || 0;
  const inProgressPoints = activeSprint?.stories.filter((s) => s.status === 'in-progress').reduce((s, st) => s + st.points, 0) || 0;
  const capacity = activeSprint?.capacity || 0;
  const utilization = capacity > 0 ? (totalPoints / capacity) * 100 : 0;
  const isOverCommitted = totalPoints > capacity;

  const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedStories = [...(activeSprint?.stories || [])].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const exportMarkdown = (): string => {
    if (!activeSprint) return '';
    let md = `# ${activeSprint.name}\n\n`;
    md += `**Period:** ${activeSprint.startDate} to ${activeSprint.endDate}\n`;
    md += `**Capacity:** ${capacity} points\n`;
    md += `**Committed:** ${totalPoints} points\n`;
    md += `**Completed:** ${donePoints} points\n\n`;

    if (activeSprint.members.length > 0) {
      md += '## Team\n\n';
      md += '| Member | Capacity |\n|--------|----------|\n';
      activeSprint.members.forEach((m) => { md += `| ${m.name} | ${m.capacity} |\n`; });
      md += '\n';
    }

    md += '## Backlog\n\n';
    md += '| Priority | Title | Points | Assignee | Status |\n|----------|-------|--------|----------|--------|\n';
    sortedStories.forEach((s) => {
      md += `| ${s.priority} | ${s.title} | ${s.points} | ${s.assignee || '-'} | ${s.status} |\n`;
    });

    return md;
  };

  const exportJSON = (): string => {
    if (!activeSprint) return '{}';
    return JSON.stringify(activeSprint, null, 2);
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setSnackbar(`${label} copied`);
  };

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Dashboard sx={{ color: '#8b5cf6', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'grey.300' }}>Sprint Planner</Typography>
        </Box>

        {/* Sprint Tabs */}
        <Paper sx={{ p: 1.5, bgcolor: '#111', border: '1px solid #222', mb: 2, display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
          {sprints.map((s) => (
            <Chip key={s.id} label={s.name} onClick={() => setActiveSprintId(s.id)}
              onDelete={sprints.length > 1 ? () => removeSprint(s.id) : undefined}
              sx={{ bgcolor: activeSprintId === s.id ? '#8b5cf6' : 'transparent', color: activeSprintId === s.id ? '#fff' : 'grey.400', borderColor: '#333', border: '1px solid', fontWeight: 600 }} />
          ))}
          <Chip label="+ Sprint" onClick={addSprint} variant="outlined" sx={{ borderColor: '#333', color: 'grey.500', borderStyle: 'dashed' }} />
        </Paper>

        {activeSprint && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Left: Config + Add */}
            <Box sx={{ flex: '1 1 380px', minWidth: 300 }}>
              {/* Sprint Settings */}
              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Sprint Settings</Typography>
                <TextField fullWidth size="small" label="Sprint Name" value={activeSprint.name}
                  onChange={(e) => updateSprint(activeSprint.id, { name: e.target.value })}
                  sx={{ mb: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" label="Start Date" type="date" value={activeSprint.startDate}
                    onChange={(e) => updateSprint(activeSprint.id, { startDate: e.target.value })} InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                  <TextField size="small" label="End Date" type="date" value={activeSprint.endDate}
                    onChange={(e) => updateSprint(activeSprint.id, { endDate: e.target.value })} InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                </Box>
                <TextField size="small" label="Total Capacity (points)" type="number" value={activeSprint.capacity}
                  onChange={(e) => updateSprint(activeSprint.id, { capacity: Math.max(0, parseInt(e.target.value) || 0) })}
                  sx={{ '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
              </Paper>

              {/* Team Members */}
              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Team Members</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" label="Name" value={memberName} onChange={(e) => setMemberName(e.target.value)}
                    sx={{ flex: 2, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                  <TextField size="small" label="Capacity" type="number" value={memberCapacity} onChange={(e) => setMemberCapacity(Math.max(0, parseInt(e.target.value) || 0))}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                  <Button size="small" variant="contained" onClick={addMember} disabled={!memberName.trim()}
                    sx={{ bgcolor: '#8b5cf6', minWidth: 40, '&:hover': { bgcolor: '#7c3aed' } }}><Add /></Button>
                </Box>
                {activeSprint.members.map((m) => (
                  <Box key={m.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #1a1a1a' }}>
                    <Typography variant="body2" sx={{ color: 'grey.300' }}>{m.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`${m.capacity} pts`} size="small" sx={{ bgcolor: '#1a1a2e', color: '#a78bfa', fontSize: '0.7rem' }} />
                      <IconButton size="small" onClick={() => removeMember(m.id)} sx={{ color: 'grey.600', p: 0.25 }}>
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Paper>

              {/* Add Story */}
              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Add Story / Task</Typography>
                <TextField fullWidth size="small" label="Title" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)}
                  sx={{ mb: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                <TextField fullWidth size="small" label="Description (optional)" multiline rows={2} value={storyDesc} onChange={(e) => setStoryDesc(e.target.value)}
                  sx={{ mb: 1, '& .MuiOutlinedInput-root': { color: 'grey.300' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' }, '& .MuiInputLabel-root': { color: 'grey.500' } }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Points</InputLabel>
                    <Select value={storyPoints} onChange={(e) => setStoryPoints(Number(e.target.value))} label="Points"
                      sx={{ color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                      {POINT_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Priority</InputLabel>
                    <Select value={storyPriority} onChange={(e) => setStoryPriority(e.target.value as Priority)} label="Priority"
                      sx={{ color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                      {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Assignee</InputLabel>
                    <Select value={storyAssignee} onChange={(e) => setStoryAssignee(e.target.value)} label="Assignee"
                      sx={{ color: 'grey.300', '.MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}>
                      <MenuItem value="">Unassigned</MenuItem>
                      {activeSprint.members.map((m) => <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Button fullWidth variant="contained" onClick={addStory} disabled={!storyTitle.trim()}
                  sx={{ bgcolor: '#8b5cf6', fontWeight: 600, '&:hover': { bgcolor: '#7c3aed' } }}>Add Story</Button>
              </Paper>

              {/* Export */}
              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222' }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1 }}>Export</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => copy(exportMarkdown(), 'Markdown')}
                    startIcon={<ContentCopy />} sx={{ borderColor: '#333', color: 'grey.400', flex: 1 }}>Markdown</Button>
                  <Button size="small" variant="outlined" onClick={() => copy(exportJSON(), 'JSON')}
                    startIcon={<ContentCopy />} sx={{ borderColor: '#333', color: 'grey.400', flex: 1 }}>JSON</Button>
                  <Tooltip title="Download Markdown">
                    <IconButton size="small" onClick={() => download(exportMarkdown(), `${activeSprint.name.replace(/\s+/g, '-').toLowerCase()}.md`)}
                      sx={{ color: 'grey.500' }}><Download /></IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Box>

            {/* Right: Summary + Backlog */}
            <Box sx={{ flex: '1 1 500px', minWidth: 340 }}>
              {/* Summary */}
              <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 1.5 }}>Sprint Summary</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <Box sx={{ flex: '1 1 100px', p: 1.5, bgcolor: '#0d0d0d', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 700 }}>{totalPoints}</Typography>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Total Points</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 100px', p: 1.5, bgcolor: '#0d0d0d', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#22c55e', fontWeight: 700 }}>{donePoints}</Typography>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Done</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 100px', p: 1.5, bgcolor: '#0d0d0d', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#3b82f6', fontWeight: 700 }}>{inProgressPoints}</Typography>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>In Progress</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 100px', p: 1.5, bgcolor: '#0d0d0d', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: capacity - totalPoints >= 0 ? '#4ade80' : '#ef4444', fontWeight: 700 }}>{capacity - totalPoints}</Typography>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Remaining</Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'grey.500' }}>Capacity Utilization</Typography>
                    <Typography variant="caption" sx={{ color: isOverCommitted ? '#ef4444' : 'grey.400', fontWeight: 600 }}>
                      {Math.round(utilization)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, utilization)}
                    sx={{
                      height: 8, borderRadius: 4, bgcolor: '#1a1a1a',
                      '& .MuiLinearProgress-bar': { bgcolor: isOverCommitted ? '#ef4444' : utilization > 80 ? '#eab308' : '#22c55e', borderRadius: 4 },
                    }}
                  />
                </Box>

                {isOverCommitted && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1, bgcolor: '#7f1d1d22', borderRadius: 1, border: '1px solid #7f1d1d' }}>
                    <Warning sx={{ color: '#ef4444', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ color: '#fca5a5' }}>
                      Over-committed by {totalPoints - capacity} points! Consider removing stories or increasing capacity.
                    </Typography>
                  </Box>
                )}

                {/* Velocity chart (simplified bar chart) */}
                {sprints.length > 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>Velocity (Done Points by Sprint)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 80 }}>
                      {sprints.map((sp) => {
                        const done = sp.stories.filter((s) => s.status === 'done').reduce((a, s) => a + s.points, 0);
                        const maxPts = Math.max(...sprints.map((x) => x.stories.filter((s) => s.status === 'done').reduce((a, s) => a + s.points, 0)), 1);
                        const pct = (done / maxPts) * 100;
                        return (
                          <Tooltip key={sp.id} title={`${sp.name}: ${done} pts`}>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ color: 'grey.500', fontSize: '0.65rem' }}>{done}</Typography>
                              <Box sx={{ width: '100%', height: `${Math.max(pct, 5)}%`, bgcolor: sp.id === activeSprintId ? '#8b5cf6' : '#3b3b5c', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                              <Typography variant="caption" sx={{ color: 'grey.600', fontSize: '0.6rem', mt: 0.25 }}>{sp.name.replace('Sprint ', 'S')}</Typography>
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* Backlog Table */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', overflow: 'hidden' }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400', p: 2, pb: 1 }}>
                  Sprint Backlog ({sortedStories.length} items)
                </Typography>
                {sortedStories.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'grey.600', p: 2, pt: 0, textAlign: 'center' }}>No stories yet. Add stories from the left panel.</Typography>
                ) : (
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#111', color: 'grey.500', borderColor: '#222', fontSize: '0.7rem' }}>Priority</TableCell>
                          <TableCell sx={{ bgcolor: '#111', color: 'grey.500', borderColor: '#222', fontSize: '0.7rem' }}>Title</TableCell>
                          <TableCell sx={{ bgcolor: '#111', color: 'grey.500', borderColor: '#222', fontSize: '0.7rem' }}>Pts</TableCell>
                          <TableCell sx={{ bgcolor: '#111', color: 'grey.500', borderColor: '#222', fontSize: '0.7rem' }}>Assignee</TableCell>
                          <TableCell sx={{ bgcolor: '#111', color: 'grey.500', borderColor: '#222', fontSize: '0.7rem' }}>Status</TableCell>
                          <TableCell sx={{ bgcolor: '#111', color: 'grey.500', borderColor: '#222', fontSize: '0.7rem', width: 40 }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedStories.map((story) => (
                          <TableRow key={story.id} hover sx={{ '&:hover': { bgcolor: '#1a1a1a' } }}>
                            <TableCell sx={{ borderColor: '#222' }}>
                              <Chip label={story.priority} size="small"
                                sx={{ bgcolor: PRIORITY_COLORS[story.priority] + '22', color: PRIORITY_COLORS[story.priority], fontSize: '0.68rem', fontWeight: 600, height: 22 }} />
                            </TableCell>
                            <TableCell sx={{ color: 'grey.300', borderColor: '#222', fontSize: '0.8rem', maxWidth: 200 }}>
                              <Typography variant="body2" sx={{ color: 'grey.300', fontSize: '0.8rem' }} noWrap>{story.title}</Typography>
                              {story.description && <Typography variant="caption" sx={{ color: 'grey.600' }} noWrap>{story.description}</Typography>}
                            </TableCell>
                            <TableCell sx={{ borderColor: '#222' }}>
                              <Chip label={story.points} size="small" sx={{ bgcolor: '#1a1a2e', color: '#a78bfa', fontWeight: 700, fontSize: '0.75rem', height: 22 }} />
                            </TableCell>
                            <TableCell sx={{ borderColor: '#222' }}>
                              <FormControl size="small" variant="standard" sx={{ minWidth: 80 }}>
                                <Select value={story.assignee} onChange={(e) => updateStoryAssignee(story.id, e.target.value)}
                                  sx={{ color: 'grey.400', fontSize: '0.75rem', '&:before': { borderColor: '#333' } }}>
                                  <MenuItem value="" sx={{ fontSize: '0.8rem' }}><em>None</em></MenuItem>
                                  {activeSprint.members.map((m) => <MenuItem key={m.id} value={m.name} sx={{ fontSize: '0.8rem' }}>{m.name}</MenuItem>)}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ borderColor: '#222' }}>
                              <FormControl size="small" variant="standard" sx={{ minWidth: 90 }}>
                                <Select value={story.status} onChange={(e) => updateStoryStatus(story.id, e.target.value as Status)}
                                  sx={{ color: STATUS_COLORS[story.status], fontSize: '0.75rem', fontWeight: 600, '&:before': { borderColor: '#333' } }}>
                                  {(['todo', 'in-progress', 'done'] as Status[]).map((s) => (
                                    <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell sx={{ borderColor: '#222' }}>
                              <IconButton size="small" onClick={() => removeStory(story.id)} sx={{ color: 'grey.600', p: 0.25 }}>
                                <Delete sx={{ fontSize: 14 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} message={snackbar} />
    </Box>
  );
}
