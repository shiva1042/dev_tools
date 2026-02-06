import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// Lazy load the apps for better performance
const ArcGISMapApp = lazy(() => import('./apps/arcgis-map/App'));
const ESQueryApp = lazy(() => import('./apps/es-query/App'));
const IconsGeneratorApp = lazy(() => import('./apps/icons-generator/App'));
const VisualBuilderApp = lazy(() => import('./apps/visual-builder/App'));

// Utility tools
const JsonYamlEditor = lazy(() => import('./apps/json-yaml-editor/App'));
const RegexBuilder = lazy(() => import('./apps/regex-builder/App'));
const JwtDebugger = lazy(() => import('./apps/jwt-debugger/App'));
const Base64Tool = lazy(() => import('./apps/base64-tool/App'));
const UuidGenerator = lazy(() => import('./apps/uuid-generator/App'));
const CronBuilder = lazy(() => import('./apps/cron-builder/App'));
const DiffViewer = lazy(() => import('./apps/diff-viewer/App'));
const ColorPalette = lazy(() => import('./apps/color-palette/App'));
const CssGenerator = lazy(() => import('./apps/css-generator/App'));
const MarkdownEditor = lazy(() => import('./apps/markdown-editor/App'));
const DataFaker = lazy(() => import('./apps/data-faker/App'));
const ApiClient = lazy(() => import('./apps/api-client/App'));
const SqlBuilder = lazy(() => import('./apps/sql-builder/App'));
const ImageConverter = lazy(() => import('./apps/image-converter/App'));
const DockerComposeBuilder = lazy(() => import('./apps/docker-compose-builder/App'));
const K8sBuilder = lazy(() => import('./apps/k8s-builder/App'));
const NginxBuilder = lazy(() => import('./apps/nginx-builder/App'));
const OpenApiEditor = lazy(() => import('./apps/openapi-editor/App'));

// Stack-specific tools (Java, Spring Boot, Neo4j, PostgreSQL, React)
const SpringConfigBuilder = lazy(() => import('./apps/spring-config-builder/App'));
const CypherBuilder = lazy(() => import('./apps/cypher-builder/App'));
const ESMappingBuilder = lazy(() => import('./apps/es-mapping-builder/App'));
const JpaEntityGenerator = lazy(() => import('./apps/jpa-entity-generator/App'));
const MigrationGenerator = lazy(() => import('./apps/migration-generator/App'));
const JdbcBuilder = lazy(() => import('./apps/jdbc-builder/App'));
const TimestampConverter = lazy(() => import('./apps/timestamp-converter/App'));
const JsonPathTester = lazy(() => import('./apps/jsonpath-tester/App'));
const LogbackBuilder = lazy(() => import('./apps/logback-builder/App'));
const ReactGenerator = lazy(() => import('./apps/react-generator/App'));
const MapStructGenerator = lazy(() => import('./apps/mapstruct-generator/App'));
const PostgreSQLBuilder = lazy(() => import('./apps/postgresql-builder/App'));

// NEW TOOLS
const UrlEncoder = lazy(() => import('./apps/url-encoder/App'));
const HtmlEntityEncoder = lazy(() => import('./apps/html-entity-encoder/App'));
const TextCaseConverter = lazy(() => import('./apps/text-case-converter/App'));
const PasswordGenerator = lazy(() => import('./apps/password-generator/App'));
const LoremIpsum = lazy(() => import('./apps/lorem-ipsum/App'));
const IpCalculator = lazy(() => import('./apps/ip-calculator/App'));
const SslDecoder = lazy(() => import('./apps/ssl-decoder/App'));
const GraphqlBuilder = lazy(() => import('./apps/graphql-builder/App'));
const MongodbBuilder = lazy(() => import('./apps/mongodb-builder/App'));
const RedisBuilder = lazy(() => import('./apps/redis-builder/App'));
const GitignoreGenerator = lazy(() => import('./apps/gitignore-generator/App'));
const GithubActionsBuilder = lazy(() => import('./apps/github-actions-builder/App'));
const TerraformBuilder = lazy(() => import('./apps/terraform-builder/App'));
const PomGenerator = lazy(() => import('./apps/pom-generator/App'));
const SpringSecurityBuilder = lazy(() => import('./apps/spring-security-builder/App'));
const MermaidEditor = lazy(() => import('./apps/mermaid-editor/App'));
const AsciiTable = lazy(() => import('./apps/ascii-table/App'));
const ErdBuilder = lazy(() => import('./apps/erd-builder/App'));
const MockApi = lazy(() => import('./apps/mock-api/App'));
const WebsocketTester = lazy(() => import('./apps/websocket-tester/App'));
const LoadTestConfig = lazy(() => import('./apps/load-test-config/App'));
const MapDraw = lazy(() => import('./apps/map-draw/App'));

// Office Tools
const QrGenerator = lazy(() => import('./apps/qr-generator/App'));
const InvoiceGenerator = lazy(() => import('./apps/invoice-generator/App'));
const PomodoroTimer = lazy(() => import('./apps/pomodoro-timer/App'));
const KanbanBoard = lazy(() => import('./apps/kanban-board/App'));
const UnitConverter = lazy(() => import('./apps/unit-converter/App'));
const EmailSignature = lazy(() => import('./apps/email-signature/App'));
const WorldClock = lazy(() => import('./apps/world-clock/App'));
const ExpenseTracker = lazy(() => import('./apps/expense-tracker/App'));
const CharacterCounter = lazy(() => import('./apps/character-counter/App'));
const HashGenerator = lazy(() => import('./apps/hash-generator/App'));
const FileSizeCalculator = lazy(() => import('./apps/file-size-calculator/App'));
const MeetingNotes = lazy(() => import('./apps/meeting-notes/App'));
const BudgetPlanner = lazy(() => import('./apps/budget-planner/App'));
const SalaryCalculator = lazy(() => import('./apps/salary-calculator/App'));
const CountdownTimer = lazy(() => import('./apps/countdown-timer/App'));
const Stopwatch = lazy(() => import('./apps/stopwatch/App'));
const NotePad = lazy(() => import('./apps/note-pad/App'));
const Checklist = lazy(() => import('./apps/checklist/App'));
const BmiCalculator = lazy(() => import('./apps/bmi-calculator/App'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-400 text-lg">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Original tools */}
        <Route path="/arcgis-map/*" element={<ArcGISMapApp />} />
        <Route path="/es-query/*" element={<ESQueryApp />} />
        <Route path="/icons-generator/*" element={<IconsGeneratorApp />} />
        <Route path="/visual-builder/*" element={<VisualBuilderApp />} />
        {/* Utility tools */}
        <Route path="/json-yaml/*" element={<JsonYamlEditor />} />
        <Route path="/regex/*" element={<RegexBuilder />} />
        <Route path="/jwt/*" element={<JwtDebugger />} />
        <Route path="/base64/*" element={<Base64Tool />} />
        <Route path="/uuid/*" element={<UuidGenerator />} />
        <Route path="/cron/*" element={<CronBuilder />} />
        <Route path="/diff/*" element={<DiffViewer />} />
        <Route path="/colors/*" element={<ColorPalette />} />
        <Route path="/css/*" element={<CssGenerator />} />
        <Route path="/markdown/*" element={<MarkdownEditor />} />
        <Route path="/faker/*" element={<DataFaker />} />
        <Route path="/api-client/*" element={<ApiClient />} />
        <Route path="/sql/*" element={<SqlBuilder />} />
        <Route path="/image/*" element={<ImageConverter />} />
        <Route path="/docker/*" element={<DockerComposeBuilder />} />
        <Route path="/k8s/*" element={<K8sBuilder />} />
        <Route path="/nginx/*" element={<NginxBuilder />} />
        <Route path="/openapi/*" element={<OpenApiEditor />} />
        {/* Stack-specific tools */}
        <Route path="/spring-config/*" element={<SpringConfigBuilder />} />
        <Route path="/cypher/*" element={<CypherBuilder />} />
        <Route path="/es-mapping/*" element={<ESMappingBuilder />} />
        <Route path="/jpa-entity/*" element={<JpaEntityGenerator />} />
        <Route path="/migration/*" element={<MigrationGenerator />} />
        <Route path="/jdbc/*" element={<JdbcBuilder />} />
        <Route path="/timestamp/*" element={<TimestampConverter />} />
        <Route path="/jsonpath/*" element={<JsonPathTester />} />
        <Route path="/logback/*" element={<LogbackBuilder />} />
        <Route path="/react-gen/*" element={<ReactGenerator />} />
        <Route path="/mapstruct/*" element={<MapStructGenerator />} />
        <Route path="/postgresql/*" element={<PostgreSQLBuilder />} />
        {/* NEW TOOLS */}
        <Route path="/url-encoder/*" element={<UrlEncoder />} />
        <Route path="/html-entity/*" element={<HtmlEntityEncoder />} />
        <Route path="/text-case/*" element={<TextCaseConverter />} />
        <Route path="/password/*" element={<PasswordGenerator />} />
        <Route path="/lorem-ipsum/*" element={<LoremIpsum />} />
        <Route path="/ip-calc/*" element={<IpCalculator />} />
        <Route path="/ssl-decoder/*" element={<SslDecoder />} />
        <Route path="/graphql/*" element={<GraphqlBuilder />} />
        <Route path="/mongodb/*" element={<MongodbBuilder />} />
        <Route path="/redis/*" element={<RedisBuilder />} />
        <Route path="/gitignore/*" element={<GitignoreGenerator />} />
        <Route path="/github-actions/*" element={<GithubActionsBuilder />} />
        <Route path="/terraform/*" element={<TerraformBuilder />} />
        <Route path="/pom/*" element={<PomGenerator />} />
        <Route path="/spring-security/*" element={<SpringSecurityBuilder />} />
        <Route path="/mermaid/*" element={<MermaidEditor />} />
        <Route path="/ascii-table/*" element={<AsciiTable />} />
        <Route path="/erd/*" element={<ErdBuilder />} />
        <Route path="/mock-api/*" element={<MockApi />} />
        <Route path="/websocket/*" element={<WebsocketTester />} />
        <Route path="/load-test/*" element={<LoadTestConfig />} />
        <Route path="/map-draw/*" element={<MapDraw />} />
        {/* Office Tools */}
        <Route path="/qr-generator/*" element={<QrGenerator />} />
        <Route path="/invoice-generator/*" element={<InvoiceGenerator />} />
        <Route path="/pomodoro/*" element={<PomodoroTimer />} />
        <Route path="/kanban/*" element={<KanbanBoard />} />
        <Route path="/unit-converter/*" element={<UnitConverter />} />
        <Route path="/email-signature/*" element={<EmailSignature />} />
        <Route path="/world-clock/*" element={<WorldClock />} />
        <Route path="/expense-tracker/*" element={<ExpenseTracker />} />
        <Route path="/character-counter/*" element={<CharacterCounter />} />
        <Route path="/hash-generator/*" element={<HashGenerator />} />
        <Route path="/file-size/*" element={<FileSizeCalculator />} />
        <Route path="/meeting-notes/*" element={<MeetingNotes />} />
        <Route path="/budget-planner/*" element={<BudgetPlanner />} />
        <Route path="/salary-calculator/*" element={<SalaryCalculator />} />
        <Route path="/countdown/*" element={<CountdownTimer />} />
        <Route path="/stopwatch/*" element={<Stopwatch />} />
        <Route path="/notepad/*" element={<NotePad />} />
        <Route path="/checklist/*" element={<Checklist />} />
        <Route path="/bmi/*" element={<BmiCalculator />} />
      </Routes>
    </Suspense>
  );
}

export default App;
