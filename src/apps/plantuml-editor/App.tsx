import { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip, Select, MenuItem,
  FormControl, InputLabel, Snackbar, Chip, Tabs, Tab,
} from '@mui/material';
import { ContentCopy, Home, Add, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const sxField = { '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiInputBase-input': { color: 'grey.300' }, '& .MuiSelect-icon': { color: 'grey.500' } };

type DiagramType = 'sequence' | 'class' | 'activity' | 'usecase' | 'state' | 'component' | 'deployment' | 'object' | 'timing';

const TEMPLATES: Record<DiagramType, string> = {
  sequence: `@startuml
title Sequence Diagram Example

actor User
participant "Web App" as App
participant "API Server" as API
database "Database" as DB

User -> App: Open page
activate App
App -> API: GET /data
activate API
API -> DB: SELECT query
activate DB
DB --> API: Result set
deactivate DB
API --> App: JSON response
deactivate API
App --> User: Render page
deactivate App

note right of API: API handles\\nauthentication

alt Success
  User -> App: Submit form
  App -> API: POST /data
  API --> App: 201 Created
else Failure
  API --> App: 400 Bad Request
  App --> User: Show error
end

@enduml`,
  class: `@startuml
title Class Diagram Example

abstract class Animal {
  - name: String
  - age: int
  + getName(): String
  + makeSound(): void {abstract}
}

class Dog extends Animal {
  - breed: String
  + makeSound(): void
  + fetch(): void
}

class Cat extends Animal {
  - indoor: boolean
  + makeSound(): void
  + purr(): void
}

interface Trainable {
  + train(command: String): void
  + obey(): boolean
}

Dog ..|> Trainable

class Owner {
  - name: String
  - pets: List<Animal>
  + addPet(animal: Animal): void
}

Owner "1" *-- "0..*" Animal : owns

@enduml`,
  activity: `@startuml
title Activity Diagram Example

start

:Receive request;

if (Authenticated?) then (yes)
  :Load user profile;

  fork
    :Fetch preferences;
  fork again
    :Fetch notifications;
  end fork

  :Build response;

  while (More items?) is (yes)
    :Process item;
  endwhile (no)

  :Send response;
else (no)
  :Return 401 Unauthorized;
endif

stop

@enduml`,
  usecase: `@startuml
title Use Case Diagram Example

left to right direction

actor Customer
actor Admin

rectangle "E-Commerce System" {
  usecase "Browse Products" as UC1
  usecase "Add to Cart" as UC2
  usecase "Checkout" as UC3
  usecase "Make Payment" as UC4
  usecase "Manage Products" as UC5
  usecase "View Reports" as UC6

  Customer --> UC1
  Customer --> UC2
  Customer --> UC3
  UC3 --> UC4 : <<include>>

  Admin --> UC5
  Admin --> UC6
}

@enduml`,
  state: `@startuml
title State Diagram Example

[*] --> Idle

state Idle {
  [*] --> WaitingForInput
}

Idle --> Processing : Submit
Processing --> Validating : Parse input

state Validating {
  [*] --> CheckFormat
  CheckFormat --> CheckRules : Format OK
  CheckFormat --> Error : Invalid format
  CheckRules --> [*] : Valid
  CheckRules --> Error : Rule violation
}

Validating --> Saving : Valid
Validating --> Idle : Invalid

Saving --> Completed : Success
Saving --> Error : Failure

Error --> Idle : Retry
Completed --> [*]

@enduml`,
  component: `@startuml
title Component Diagram Example

package "Frontend" {
  [React App] as FE
  [State Manager] as SM
}

package "Backend" {
  [REST API] as API
  [Auth Service] as Auth
  [Business Logic] as BL
}

package "Data Layer" {
  [Database] as DB
  [Cache] as Cache
}

FE --> SM
FE --> API : HTTP/REST
API --> Auth : Authenticate
API --> BL : Process
BL --> DB : Read/Write
BL --> Cache : Cache queries

@enduml`,
  deployment: `@startuml
title Deployment Diagram Example

node "Client" {
  [Browser]
}

cloud "CDN" {
  [Static Assets]
}

node "Load Balancer" {
  [Nginx]
}

node "App Server 1" {
  [Node.js App]
}

node "App Server 2" {
  [Node.js App] as App2
}

database "Primary DB" {
  [PostgreSQL]
}

database "Replica DB" {
  [PostgreSQL] as PgReplica
}

[Browser] --> [Static Assets]
[Browser] --> [Nginx]
[Nginx] --> [Node.js App]
[Nginx] --> App2
[Node.js App] --> [PostgreSQL]
App2 --> PgReplica

@enduml`,
  object: `@startuml
title Object Diagram Example

object "user1 : User" as u1 {
  id = 1
  name = "Alice"
  email = "alice@example.com"
  role = "admin"
}

object "user2 : User" as u2 {
  id = 2
  name = "Bob"
  email = "bob@example.com"
  role = "member"
}

object "team1 : Team" as t1 {
  id = 1
  name = "Engineering"
}

object "project1 : Project" as p1 {
  id = 1
  name = "Platform"
  status = "active"
}

t1 --> u1 : members
t1 --> u2 : members
t1 --> p1 : projects
u1 --> p1 : manages

@enduml`,
  timing: `@startuml
title Timing Diagram Example

robust "Web Server" as WS
concise "Client" as C

@0
WS is Idle
C is Idle

@100
C is Requesting
WS is Processing

@200
WS is Responding

@250
C is Rendering
WS is Idle

@400
C is Complete

@500
C is Idle

@enduml`,
};

const SNIPPETS = [
  { label: 'Note', code: 'note right of Actor: Note text' },
  { label: 'Activate', code: 'activate Participant' },
  { label: 'Alt block', code: 'alt Condition\n  ...\nelse Other\n  ...\nend' },
  { label: 'Loop', code: 'loop N times\n  ...\nend' },
  { label: 'Group', code: 'group Label\n  ...\nend' },
  { label: 'Divider', code: '== Section ==' },
  { label: 'Arrow styles', code: "A -> B: solid\nA --> B: dashed\nA ->> B: async\nA ->x B: lost" },
  { label: 'Class field', code: '+ publicMethod(): void\n- privateField: String\n# protectedMethod(): int' },
  { label: 'Inheritance', code: 'Child --|> Parent' },
  { label: 'Composition', code: 'Parent *-- Child' },
  { label: 'Aggregation', code: 'Parent o-- Child' },
  { label: 'Dependency', code: 'ClassA ..> ClassB' },
  { label: 'Interface impl', code: 'Class ..|> Interface' },
  { label: 'If/else', code: 'if (condition?) then (yes)\n  :action;\nelse (no)\n  :other action;\nendif' },
  { label: 'Fork/Join', code: 'fork\n  :task 1;\nfork again\n  :task 2;\nend fork' },
  { label: 'While loop', code: 'while (condition?) is (yes)\n  :action;\nendwhile (no)' },
  { label: 'Start/Stop', code: 'start\n...\nstop' },
];

const THEMES = [
  { label: 'Default', directive: '' },
  { label: 'Monochrome', directive: 'skinparam monochrome true' },
  { label: 'Sketchy', directive: 'skinparam handwritten true' },
  { label: 'Dark Blue', directive: 'skinparam backgroundColor #1a1a2e\nskinparam defaultFontColor #e0e0e0\nskinparam classBorderColor #16213e\nskinparam classBackgroundColor #0f3460' },
  { label: 'Minimal', directive: 'skinparam shadowing false\nskinparam defaultFontSize 12\nskinparam roundcorner 8' },
];

const SYNTAX_REF: Record<string, string[]> = {
  'Arrows': ['A -> B : label', 'A --> B : dashed', 'A ->> B : async', 'A ->o B : circle end', 'A ->x B : cross end', 'A <-> B : bidirectional'],
  'Participants': ['actor Name', 'participant "Label" as Alias', 'boundary Name', 'control Name', 'entity Name', 'database Name', 'queue Name'],
  'Class Members': ['+ public', '- private', '# protected', '~ package-private', '{abstract}', '{static}'],
  'Relationships': ['A --|> B : extends', 'A ..|> B : implements', 'A *-- B : composition', 'A o-- B : aggregation', 'A --> B : association', 'A ..> B : dependency'],
};

export default function App() {
  const [diagramType, setDiagramType] = useState<DiagramType>('sequence');
  const [code, setCode] = useState(TEMPLATES.sequence);
  const [theme, setTheme] = useState(0);
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = useCallback((t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); }, []);

  const applyTheme = (idx: number) => {
    setTheme(idx);
    const t = THEMES[idx];
    if (!t.directive) {
      setCode(prev => prev.replace(/^(skinparam .*\n)*/gm, '').replace(/@startuml\n*/, '@startuml\n'));
      return;
    }
    setCode(prev => {
      const cleaned = prev.replace(/^(skinparam .*\n)*/gm, '').replace(/@startuml\n*/, '@startuml\n');
      return cleaned.replace('@startuml\n', `@startuml\n${t.directive}\n`);
    });
  };

  const loadTemplate = (type: DiagramType) => {
    setDiagramType(type);
    setCode(TEMPLATES[type]);
    setTheme(0);
  };

  const insertSnippet = (snippet: string) => {
    setCode(prev => {
      const endIdx = prev.lastIndexOf('@enduml');
      if (endIdx === -1) return prev + '\n' + snippet;
      return prev.slice(0, endIdx) + snippet + '\n\n' + prev.slice(endIdx);
    });
  };

  const finalCode = useMemo(() => code, [code]);

  const diagramTypes: { key: DiagramType; label: string }[] = [
    { key: 'sequence', label: 'Sequence' }, { key: 'class', label: 'Class' }, { key: 'activity', label: 'Activity' },
    { key: 'usecase', label: 'Use Case' }, { key: 'state', label: 'State' }, { key: 'component', label: 'Component' },
    { key: 'deployment', label: 'Deployment' }, { key: 'object', label: 'Object' }, { key: 'timing', label: 'Timing' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>PlantUML Editor</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {diagramTypes.map(d => (
            <Chip key={d.key} label={d.label} size="small" onClick={() => loadTemplate(d.key)}
              sx={{ bgcolor: diagramType === d.key ? '#1976d222' : '#222', color: diagramType === d.key ? '#90caf9' : 'grey.400', border: `1px solid ${diagramType === d.key ? '#1976d2' : '#333'}`, cursor: 'pointer' }} />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Box sx={{ flex: 2, minWidth: 400 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>PlantUML Code</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 120, ...sxField }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Theme</InputLabel>
                    <Select value={theme} onChange={e => applyTheme(Number(e.target.value))} label="Theme" sx={{ color: 'grey.300' }}>
                      {THEMES.map((t, i) => <MenuItem key={i} value={i}>{t.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Tooltip title="Copy PlantUML code"><IconButton onClick={() => copy(finalCode)} sx={{ color: 'grey.400' }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
              <TextField multiline rows={20} fullWidth value={code} onChange={e => setCode(e.target.value)}
                sx={{ fontFamily: 'monospace', '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' } }, '& .MuiInputBase-input': { color: '#81c784', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5 } }} />
            </Paper>
          </Box>

          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1, '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', fontSize: 12, minWidth: 60 }, '& .Mui-selected': { color: '#90caf9' } }}>
                <Tab label="Snippets" /><Tab label="Syntax Ref" />
              </Tabs>

              {tab === 0 && (
                <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                  {SNIPPETS.map((s, i) => (
                    <Box key={i} sx={{ mb: 1, p: 1, bgcolor: '#0a0a0a', borderRadius: 1, '&:hover': { bgcolor: '#141414' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'grey.400', fontWeight: 600 }}>{s.label}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Insert"><IconButton size="small" onClick={() => insertSnippet(s.code)} sx={{ color: 'grey.500' }}><Add sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                          <Tooltip title="Copy"><IconButton size="small" onClick={() => copy(s.code)} sx={{ color: 'grey.500' }}><ContentCopy sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                        </Box>
                      </Box>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#81c784', whiteSpace: 'pre' }}>{s.code}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {tab === 1 && (
                <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                  {Object.entries(SYNTAX_REF).map(([section, items]) => (
                    <Box key={section} sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'grey.400', fontWeight: 600, display: 'block', mb: 0.5 }}>{section}</Typography>
                      {items.map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: 11, color: '#90caf9', flex: 1 }}>{item}</Typography>
                          <IconButton size="small" onClick={() => copy(item.split(':')[0].trim())} sx={{ color: 'grey.600' }}><ContentCopy sx={{ fontSize: 10 }} /></IconButton>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={1500} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
