import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Map as MapIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  Layers,
  Database,
  Palette,
  FileJson,
  Regex,
  Key,
  Binary,
  Fingerprint,
  Clock,
  GitCompare,
  Brush,
  FileText,
  Users,
  Globe,
  Server,
  FileCode,
  Scissors,
  Container,
  Cloud,
  Leaf,
  Network,
  TableProperties,
  FileSpreadsheet,
  Link as LinkIcon,
  Timer,
  Braces,
  ScrollText,
  Component,
  ArrowLeftRight,
  FunctionSquare,
  Sparkles,
  Filter,
  // New icons for additional tools
  Lock,
  FileCode2,
  Type,
  KeyRound,
  FileType,
  Wifi,
  Shield,
  GitBranch,
  Cylinder,
  HardDrive,
  FileX,
  GitPullRequest,
  Boxes,
  Package,
  ShieldCheck,
  Workflow,
  Table,
  DatabaseZap,
  Plug,
  Gauge,
  FlaskConical,
  // Office tools icons
  QrCode,
  Receipt,
  Timer as TimerIcon,
  KanbanSquare,
  ArrowRightLeft,
  Mail,
  Globe2,
  Wallet,
  TextCursor,
  Briefcase,
  Hash,
  HardDriveDownload,
  NotebookPen,
  Calculator,
  DollarSign,
  Hourglass,
  AlarmClock,
  StickyNote,
  ListChecks,
  Scale,
} from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  to: string;
  category: string;
  isNew?: boolean;
}

const categories = [
  { id: 'all', label: 'All Tools', icon: <Layers className="w-4 h-4" /> },
  { id: 'gis', label: 'GIS & Maps', icon: <MapIcon className="w-4 h-4" /> },
  { id: 'data', label: 'Data & API', icon: <Database className="w-4 h-4" /> },
  { id: 'code', label: 'Code Gen', icon: <CodeIcon className="w-4 h-4" /> },
  { id: 'devops', label: 'DevOps', icon: <Container className="w-4 h-4" /> },
  { id: 'testing', label: 'Testing', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'office', label: 'Office', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'utils', label: 'Utilities', icon: <Sparkles className="w-4 h-4" /> },
];

const tools: Tool[] = [
  // GIS & Maps
  {
    title: 'ArcGIS Map Builder',
    description: 'Visual map builder with layers, widgets & code export',
    icon: <MapIcon className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-teal-600',
    to: '/arcgis-map',
    category: 'gis',
  },
  {
    title: 'Map Draw Tool',
    description: 'Draw points, polygons & circles on map, export as PNG/JPG',
    icon: <Brush className="w-5 h-5" />,
    gradient: 'from-cyan-500 to-teal-600',
    to: '/map-draw',
    category: 'gis',
    isNew: true,
  },
  // Data & API
  {
    title: 'ES Query Designer',
    description: 'Visual Elasticsearch query builder',
    icon: <SearchIcon className="w-5 h-5" />,
    gradient: 'from-blue-500 to-indigo-600',
    to: '/es-query',
    category: 'data',
  },
  {
    title: 'API Request Builder',
    description: 'REST API client with history',
    icon: <Globe className="w-5 h-5" />,
    gradient: 'from-cyan-500 to-blue-600',
    to: '/api-client',
    category: 'data',
    isNew: true,
  },
  {
    title: 'JSON/YAML Editor',
    description: 'Validate, format & convert',
    icon: <FileJson className="w-5 h-5" />,
    gradient: 'from-amber-500 to-orange-600',
    to: '/json-yaml',
    category: 'data',
    isNew: true,
  },
  {
    title: 'SQL Query Builder',
    description: 'Visual SQL query constructor',
    icon: <Database className="w-5 h-5" />,
    gradient: 'from-blue-600 to-indigo-700',
    to: '/sql',
    category: 'data',
    isNew: true,
  },
  {
    title: 'ES Index Mapping',
    description: 'Design ES index mappings',
    icon: <SearchIcon className="w-5 h-5" />,
    gradient: 'from-yellow-500 to-orange-500',
    to: '/es-mapping',
    category: 'data',
    isNew: true,
  },
  {
    title: 'Cypher Query Builder',
    description: 'Neo4j Cypher query builder',
    icon: <Network className="w-5 h-5" />,
    gradient: 'from-blue-400 to-cyan-500',
    to: '/cypher',
    category: 'data',
    isNew: true,
  },
  {
    title: 'JSONPath Tester',
    description: 'Test JSONPath expressions',
    icon: <Braces className="w-5 h-5" />,
    gradient: 'from-orange-400 to-red-500',
    to: '/jsonpath',
    category: 'data',
    isNew: true,
  },
  // Code Generation
  {
    title: 'Icon Generator Pro',
    description: '15K+ icons with custom shapes',
    icon: <ImageIcon className="w-5 h-5" />,
    gradient: 'from-purple-500 to-pink-600',
    to: '/icons-generator',
    category: 'code',
  },
  {
    title: 'React Visual Builder',
    description: 'Drag-and-drop MUI components',
    icon: <CodeIcon className="w-5 h-5" />,
    gradient: 'from-orange-500 to-red-600',
    to: '/visual-builder',
    category: 'code',
  },
  {
    title: 'React Component Gen',
    description: 'Generate React components',
    icon: <Component className="w-5 h-5" />,
    gradient: 'from-cyan-400 to-blue-500',
    to: '/react-gen',
    category: 'code',
    isNew: true,
  },
  {
    title: 'JPA Entity Generator',
    description: 'Generate JPA entities & repos',
    icon: <TableProperties className="w-5 h-5" />,
    gradient: 'from-indigo-500 to-purple-600',
    to: '/jpa-entity',
    category: 'code',
    isNew: true,
  },
  {
    title: 'MapStruct Mapper',
    description: 'DTO-Entity mapper generator',
    icon: <ArrowLeftRight className="w-5 h-5" />,
    gradient: 'from-violet-500 to-fuchsia-600',
    to: '/mapstruct',
    category: 'code',
    isNew: true,
  },
  {
    title: 'PostgreSQL Functions',
    description: 'PL/pgSQL function builder',
    icon: <FunctionSquare className="w-5 h-5" />,
    gradient: 'from-blue-600 to-indigo-700',
    to: '/postgresql',
    category: 'code',
    isNew: true,
  },
  {
    title: 'OpenAPI Editor',
    description: 'Visual API documentation',
    icon: <FileCode className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-green-600',
    to: '/openapi',
    category: 'code',
    isNew: true,
  },
  {
    title: 'DB Migration Gen',
    description: 'Flyway/Liquibase scripts',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    gradient: 'from-teal-500 to-cyan-600',
    to: '/migration',
    category: 'code',
    isNew: true,
  },
  // DevOps
  {
    title: 'Docker Compose',
    description: 'Visual docker-compose builder',
    icon: <Container className="w-5 h-5" />,
    gradient: 'from-blue-400 to-cyan-500',
    to: '/docker',
    category: 'devops',
    isNew: true,
  },
  {
    title: 'Kubernetes YAML',
    description: 'K8s manifest generator',
    icon: <Cloud className="w-5 h-5" />,
    gradient: 'from-blue-500 to-violet-600',
    to: '/k8s',
    category: 'devops',
    isNew: true,
  },
  {
    title: 'Nginx Config',
    description: 'nginx.conf generator',
    icon: <Server className="w-5 h-5" />,
    gradient: 'from-green-500 to-emerald-600',
    to: '/nginx',
    category: 'devops',
    isNew: true,
  },
  {
    title: 'Spring Boot Config',
    description: 'application.yml builder',
    icon: <Leaf className="w-5 h-5" />,
    gradient: 'from-green-500 to-lime-600',
    to: '/spring-config',
    category: 'devops',
    isNew: true,
  },
  {
    title: 'Logback Config',
    description: 'Logging configuration',
    icon: <ScrollText className="w-5 h-5" />,
    gradient: 'from-red-500 to-pink-600',
    to: '/logback',
    category: 'devops',
    isNew: true,
  },
  {
    title: 'JDBC Connection',
    description: 'Connection string builder',
    icon: <LinkIcon className="w-5 h-5" />,
    gradient: 'from-slate-500 to-zinc-600',
    to: '/jdbc',
    category: 'devops',
    isNew: true,
  },
  // Utilities
  {
    title: 'Regex Builder',
    description: 'Visual regex constructor',
    icon: <Regex className="w-5 h-5" />,
    gradient: 'from-rose-500 to-pink-600',
    to: '/regex',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'JWT Debugger',
    description: 'Decode & inspect tokens',
    icon: <Key className="w-5 h-5" />,
    gradient: 'from-violet-500 to-purple-600',
    to: '/jwt',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Base64 Encoder',
    description: 'Encode/decode Base64',
    icon: <Binary className="w-5 h-5" />,
    gradient: 'from-slate-500 to-gray-600',
    to: '/base64',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'UUID & Hash Gen',
    description: 'Generate UUIDs & hashes',
    icon: <Fingerprint className="w-5 h-5" />,
    gradient: 'from-indigo-500 to-blue-600',
    to: '/uuid',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Cron Builder',
    description: 'Cron expression generator',
    icon: <Clock className="w-5 h-5" />,
    gradient: 'from-teal-500 to-emerald-600',
    to: '/cron',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Timestamp Converter',
    description: 'Convert date/time formats',
    icon: <Timer className="w-5 h-5" />,
    gradient: 'from-amber-500 to-yellow-600',
    to: '/timestamp',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Diff Viewer',
    description: 'Compare text & code',
    icon: <GitCompare className="w-5 h-5" />,
    gradient: 'from-lime-500 to-green-600',
    to: '/diff',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Color Palette',
    description: 'Generate color palettes',
    icon: <Palette className="w-5 h-5" />,
    gradient: 'from-fuchsia-500 to-pink-600',
    to: '/colors',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'CSS Generator',
    description: 'Gradients, shadows & more',
    icon: <Brush className="w-5 h-5" />,
    gradient: 'from-sky-500 to-cyan-600',
    to: '/css',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Markdown Editor',
    description: 'Live preview editor',
    icon: <FileText className="w-5 h-5" />,
    gradient: 'from-stone-500 to-neutral-600',
    to: '/markdown',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Data Faker',
    description: 'Generate fake test data',
    icon: <Users className="w-5 h-5" />,
    gradient: 'from-yellow-500 to-amber-600',
    to: '/faker',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Image Converter',
    description: 'Convert & resize images',
    icon: <Scissors className="w-5 h-5" />,
    gradient: 'from-red-500 to-rose-600',
    to: '/image',
    category: 'utils',
    isNew: true,
  },
  // NEW TOOLS - Utilities
  {
    title: 'URL Encoder',
    description: 'Encode/decode URLs',
    icon: <Lock className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-green-600',
    to: '/url-encoder',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'HTML Entity Encoder',
    description: 'Encode/decode HTML entities',
    icon: <FileCode2 className="w-5 h-5" />,
    gradient: 'from-orange-500 to-amber-600',
    to: '/html-entity',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Text Case Converter',
    description: 'Convert between case styles',
    icon: <Type className="w-5 h-5" />,
    gradient: 'from-pink-500 to-rose-600',
    to: '/text-case',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Password Generator',
    description: 'Generate secure passwords',
    icon: <KeyRound className="w-5 h-5" />,
    gradient: 'from-red-600 to-rose-700',
    to: '/password',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'Lorem Ipsum',
    description: 'Generate placeholder text',
    icon: <FileType className="w-5 h-5" />,
    gradient: 'from-gray-500 to-slate-600',
    to: '/lorem-ipsum',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'IP Calculator',
    description: 'Subnet & CIDR calculator',
    icon: <Wifi className="w-5 h-5" />,
    gradient: 'from-cyan-500 to-teal-600',
    to: '/ip-calc',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'SSL Certificate Decoder',
    description: 'Decode X.509 certificates',
    icon: <Shield className="w-5 h-5" />,
    gradient: 'from-green-600 to-emerald-700',
    to: '/ssl-decoder',
    category: 'utils',
    isNew: true,
  },
  {
    title: 'ASCII Table Generator',
    description: 'Generate ASCII tables',
    icon: <Table className="w-5 h-5" />,
    gradient: 'from-stone-500 to-zinc-600',
    to: '/ascii-table',
    category: 'utils',
    isNew: true,
  },
  // NEW TOOLS - Data & API
  {
    title: 'GraphQL Builder',
    description: 'Visual GraphQL query builder',
    icon: <GitBranch className="w-5 h-5" />,
    gradient: 'from-pink-600 to-fuchsia-700',
    to: '/graphql',
    category: 'data',
    isNew: true,
  },
  {
    title: 'MongoDB Builder',
    description: 'MongoDB query builder',
    icon: <Cylinder className="w-5 h-5" />,
    gradient: 'from-green-600 to-emerald-700',
    to: '/mongodb',
    category: 'data',
    isNew: true,
  },
  {
    title: 'Redis Commands',
    description: 'Redis command builder',
    icon: <HardDrive className="w-5 h-5" />,
    gradient: 'from-red-600 to-rose-700',
    to: '/redis',
    category: 'data',
    isNew: true,
  },
  // NEW TOOLS - Code Generation
  {
    title: 'pom.xml Generator',
    description: 'Maven POM file generator',
    icon: <Package className="w-5 h-5" />,
    gradient: 'from-orange-600 to-red-700',
    to: '/pom',
    category: 'code',
    isNew: true,
  },
  {
    title: 'Spring Security Config',
    description: 'Security configuration builder',
    icon: <ShieldCheck className="w-5 h-5" />,
    gradient: 'from-green-500 to-teal-600',
    to: '/spring-security',
    category: 'code',
    isNew: true,
  },
  {
    title: 'Mermaid Editor',
    description: 'Mermaid diagram editor',
    icon: <Workflow className="w-5 h-5" />,
    gradient: 'from-pink-500 to-purple-600',
    to: '/mermaid',
    category: 'code',
    isNew: true,
  },
  {
    title: 'ERD Builder',
    description: 'Database schema designer',
    icon: <DatabaseZap className="w-5 h-5" />,
    gradient: 'from-indigo-500 to-violet-600',
    to: '/erd',
    category: 'code',
    isNew: true,
  },
  // NEW TOOLS - DevOps
  {
    title: 'Gitignore Generator',
    description: 'Generate .gitignore files',
    icon: <FileX className="w-5 h-5" />,
    gradient: 'from-gray-600 to-slate-700',
    to: '/gitignore',
    category: 'devops',
    isNew: true,
  },
  {
    title: 'GitHub Actions Builder',
    description: 'CI/CD workflow generator',
    icon: <GitPullRequest className="w-5 h-5" />,
    gradient: 'from-purple-600 to-indigo-700',
    to: '/github-actions',
    category: 'devops',
    isNew: true,
  },
  {
    title: 'Terraform Builder',
    description: 'Generate Terraform configs',
    icon: <Boxes className="w-5 h-5" />,
    gradient: 'from-violet-600 to-purple-700',
    to: '/terraform',
    category: 'devops',
    isNew: true,
  },
  // NEW TOOLS - Testing
  {
    title: 'Mock API Server',
    description: 'Create mock REST endpoints',
    icon: <Server className="w-5 h-5" />,
    gradient: 'from-cyan-600 to-blue-700',
    to: '/mock-api',
    category: 'testing',
    isNew: true,
  },
  {
    title: 'WebSocket Tester',
    description: 'Test WebSocket connections',
    icon: <Plug className="w-5 h-5" />,
    gradient: 'from-yellow-500 to-amber-600',
    to: '/websocket',
    category: 'testing',
    isNew: true,
  },
  {
    title: 'Load Test Config',
    description: 'Generate load test scripts',
    icon: <Gauge className="w-5 h-5" />,
    gradient: 'from-red-500 to-orange-600',
    to: '/load-test',
    category: 'testing',
    isNew: true,
  },
  // Office Tools
  {
    title: 'QR Code Generator',
    description: 'Create QR codes for URLs, text, WiFi',
    icon: <QrCode className="w-5 h-5" />,
    gradient: 'from-violet-500 to-purple-600',
    to: '/qr-generator',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Invoice Generator',
    description: 'Create professional invoices',
    icon: <Receipt className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-green-600',
    to: '/invoice-generator',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Pomodoro Timer',
    description: 'Focus timer with work/break intervals',
    icon: <TimerIcon className="w-5 h-5" />,
    gradient: 'from-red-500 to-rose-600',
    to: '/pomodoro',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Kanban Board',
    description: 'Drag-and-drop task management',
    icon: <KanbanSquare className="w-5 h-5" />,
    gradient: 'from-blue-500 to-indigo-600',
    to: '/kanban',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Unit Converter',
    description: 'Convert length, weight, temperature & more',
    icon: <ArrowRightLeft className="w-5 h-5" />,
    gradient: 'from-amber-500 to-orange-600',
    to: '/unit-converter',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Email Signature',
    description: 'Generate professional email signatures',
    icon: <Mail className="w-5 h-5" />,
    gradient: 'from-pink-500 to-rose-600',
    to: '/email-signature',
    category: 'office',
    isNew: true,
  },
  {
    title: 'World Clock',
    description: 'Track time across multiple timezones',
    icon: <Globe2 className="w-5 h-5" />,
    gradient: 'from-cyan-500 to-blue-600',
    to: '/world-clock',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Expense Tracker',
    description: 'Track income & expenses by category',
    icon: <Wallet className="w-5 h-5" />,
    gradient: 'from-green-500 to-emerald-600',
    to: '/expense-tracker',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Character Counter',
    description: 'Count characters, words & reading time',
    icon: <TextCursor className="w-5 h-5" />,
    gradient: 'from-purple-500 to-violet-600',
    to: '/character-counter',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-256, SHA-512 hashes',
    icon: <Hash className="w-5 h-5" />,
    gradient: 'from-indigo-500 to-purple-600',
    to: '/hash-generator',
    category: 'office',
    isNew: true,
  },
  {
    title: 'File Size Calculator',
    description: 'Convert between file size units',
    icon: <HardDriveDownload className="w-5 h-5" />,
    gradient: 'from-cyan-500 to-teal-600',
    to: '/file-size',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Meeting Notes',
    description: 'Create structured meeting notes',
    icon: <NotebookPen className="w-5 h-5" />,
    gradient: 'from-amber-500 to-orange-600',
    to: '/meeting-notes',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Budget Planner',
    description: 'Plan and track your budget',
    icon: <Calculator className="w-5 h-5" />,
    gradient: 'from-emerald-500 to-green-600',
    to: '/budget-planner',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Salary Calculator',
    description: 'Calculate take-home pay & taxes',
    icon: <DollarSign className="w-5 h-5" />,
    gradient: 'from-green-500 to-teal-600',
    to: '/salary-calculator',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Countdown Timer',
    description: 'Countdown to important events',
    icon: <Hourglass className="w-5 h-5" />,
    gradient: 'from-rose-500 to-red-600',
    to: '/countdown',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Stopwatch',
    description: 'Stopwatch with lap tracking',
    icon: <AlarmClock className="w-5 h-5" />,
    gradient: 'from-sky-500 to-blue-600',
    to: '/stopwatch',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Notepad',
    description: 'Simple note-taking with persistence',
    icon: <StickyNote className="w-5 h-5" />,
    gradient: 'from-yellow-500 to-amber-600',
    to: '/notepad',
    category: 'office',
    isNew: true,
  },
  {
    title: 'Checklist',
    description: 'Create and manage checklists',
    icon: <ListChecks className="w-5 h-5" />,
    gradient: 'from-teal-500 to-cyan-600',
    to: '/checklist',
    category: 'office',
    isNew: true,
  },
  {
    title: 'BMI Calculator',
    description: 'Calculate Body Mass Index',
    icon: <Scale className="w-5 h-5" />,
    gradient: 'from-pink-500 to-fuchsia-600',
    to: '/bmi',
    category: 'office',
    isNew: true,
  },
];

const ToolCard = ({ tool }: { tool: Tool }) => (
  <Link
    to={tool.to}
    className="group relative flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/40 hover:bg-gray-800/70 hover:border-gray-600/60 transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
  >
    {/* Icon */}
    <div
      className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-lg`}
    >
      {tool.icon}
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
          {tool.title}
        </h3>
        {tool.isNew && (
          <span className="flex-shrink-0 text-[10px] font-semibold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
            NEW
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 truncate">{tool.description}</p>
    </div>
  </Link>
);

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const newToolsCount = tools.filter((t) => t.isNew).length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Subtle background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Compact Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dev Tools{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>
          <p className="text-gray-500 text-sm">
            {tools.length} tools for development, data & infrastructure
          </p>
        </header>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-800/40 text-gray-400 border border-gray-700/40 hover:bg-gray-800/60 hover:text-gray-300'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              {filteredTools.length} tools
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {newToolsCount} new
            </span>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.to} tool={tool} />
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <SearchIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No tools found matching your search</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 text-blue-400 text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-xs">
          <p>Built with React 19 + TypeScript + Vite + Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}