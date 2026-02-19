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

// Students & Learning Tools
const FlashcardMaker = lazy(() => import('./apps/flashcard-maker/App'));
const GpaCalculator = lazy(() => import('./apps/gpa-calculator/App'));
const CitationGenerator = lazy(() => import('./apps/citation-generator/App'));
const AlgorithmVisualizer = lazy(() => import('./apps/algorithm-visualizer/App'));
const DataStructureVisualizer = lazy(() => import('./apps/data-structure-visualizer/App'));
const LatexMathEditor = lazy(() => import('./apps/latex-math-editor/App'));
const CodeSnippetRunner = lazy(() => import('./apps/code-snippet-runner/App'));
const TypingSpeedTest = lazy(() => import('./apps/typing-speed-test/App'));
const NumberBaseConverter = lazy(() => import('./apps/number-base-converter/App'));
const BitwiseCalculator = lazy(() => import('./apps/bitwise-calculator/App'));
const BigOCheatsheet = lazy(() => import('./apps/big-o-cheatsheet/App'));
const PeriodicTable = lazy(() => import('./apps/periodic-table/App'));

// Developer Tools (new)
const GitCommandBuilder = lazy(() => import('./apps/git-command-builder/App'));
const ChmodCalculator = lazy(() => import('./apps/chmod-calculator/App'));
const HttpStatusReference = lazy(() => import('./apps/http-status-reference/App'));
const CodeScreenshot = lazy(() => import('./apps/code-screenshot/App'));
const SvgEditor = lazy(() => import('./apps/svg-editor/App'));
const HtmlCssPlayground = lazy(() => import('./apps/html-css-playground/App'));
const CodeFormatter = lazy(() => import('./apps/code-formatter/App'));
const WebhookTester = lazy(() => import('./apps/webhook-tester/App'));
const PackageJsonGenerator = lazy(() => import('./apps/package-json-generator/App'));
const EnvEditor = lazy(() => import('./apps/env-editor/App'));
const AsciiArtGenerator = lazy(() => import('./apps/ascii-art-generator/App'));
const NetworkPortReference = lazy(() => import('./apps/network-port-reference/App'));
const XmlFormatter = lazy(() => import('./apps/xml-formatter/App'));
const JsonCsvConverter = lazy(() => import('./apps/json-csv-converter/App'));
const EncodingConverter = lazy(() => import('./apps/encoding-converter/App'));

// Office & Productivity Tools (new)
const GanttChart = lazy(() => import('./apps/gantt-chart/App'));
const MindMap = lazy(() => import('./apps/mind-map/App'));
const PresentationTimer = lazy(() => import('./apps/presentation-timer/App'));
const MeetingScheduler = lazy(() => import('./apps/meeting-scheduler/App'));
const EmailTemplateBuilder = lazy(() => import('./apps/email-template-builder/App'));
const HabitTracker = lazy(() => import('./apps/habit-tracker/App'));
const DailyPlanner = lazy(() => import('./apps/daily-planner/App'));
const Whiteboard = lazy(() => import('./apps/whiteboard/App'));
const CsvViewer = lazy(() => import('./apps/csv-viewer/App'));
const AgendaBuilder = lazy(() => import('./apps/agenda-builder/App'));
const ReceiptScanner = lazy(() => import('./apps/receipt-scanner/App'));
const LoanCalculator = lazy(() => import('./apps/loan-calculator/App'));
const SpreadsheetFormulaRef = lazy(() => import('./apps/spreadsheet-formula-ref/App'));

// General Utility Tools (new)
const ScientificCalculator = lazy(() => import('./apps/scientific-calculator/App'));
const BarcodeGenerator = lazy(() => import('./apps/barcode-generator/App'));
const TextDiffMerger = lazy(() => import('./apps/text-diff-merger/App'));
const MorseCodeConverter = lazy(() => import('./apps/morse-code-converter/App'));
const OcrTool = lazy(() => import('./apps/ocr-tool/App'));
const ColorBlindnessSimulator = lazy(() => import('./apps/color-blindness-simulator/App'));
const FontPreview = lazy(() => import('./apps/font-preview/App'));
const AspectRatioCalculator = lazy(() => import('./apps/aspect-ratio-calculator/App'));
const ReadabilityAnalyzer = lazy(() => import('./apps/readability-analyzer/App'));
const PrivacyRedactor = lazy(() => import('./apps/privacy-redactor/App'));

// DevOps & Infrastructure Tools
const HelmChartBuilder = lazy(() => import('./apps/helm-chart-builder/App'));
const AnsiblePlaybookBuilder = lazy(() => import('./apps/ansible-playbook-builder/App'));
const PrometheusQueryBuilder = lazy(() => import('./apps/prometheus-query-builder/App'));
const GrafanaDashboardBuilder = lazy(() => import('./apps/grafana-dashboard-builder/App'));
const VagrantFileBuilder = lazy(() => import('./apps/vagrant-file-builder/App'));
const SystemdServiceBuilder = lazy(() => import('./apps/systemd-service-builder/App'));
const ShellScriptGenerator = lazy(() => import('./apps/shell-script-generator/App'));

// Code Converters
const CurlToCode = lazy(() => import('./apps/curl-to-code/App'));
const HtmlToJsx = lazy(() => import('./apps/html-to-jsx/App'));
const CssToTailwind = lazy(() => import('./apps/css-to-tailwind/App'));
const JsonToTypescript = lazy(() => import('./apps/json-to-typescript/App'));
const JsonSchemaGenerator = lazy(() => import('./apps/json-schema-generator/App'));
const SqlToNosql = lazy(() => import('./apps/sql-to-nosql/App'));
const ProtobufBuilder = lazy(() => import('./apps/protobuf-builder/App'));

// Security & Auth Tools
const AwsIamPolicyBuilder = lazy(() => import('./apps/aws-iam-policy-builder/App'));
const CorsConfigBuilder = lazy(() => import('./apps/cors-config-builder/App'));
const CspHeaderBuilder = lazy(() => import('./apps/csp-header-builder/App'));
const Oauth2FlowVisualizer = lazy(() => import('./apps/oauth2-flow-visualizer/App'));
const RbacDesigner = lazy(() => import('./apps/rbac-designer/App'));
const SecretGenerator = lazy(() => import('./apps/secret-generator/App'));
const KafkaConfigBuilder = lazy(() => import('./apps/kafka-config-builder/App'));
const RabbitmqConfigBuilder = lazy(() => import('./apps/rabbitmq-config-builder/App'));

// API & Frontend Tools
const NginxLocationTester = lazy(() => import('./apps/nginx-location-tester/App'));
const HtaccessGenerator = lazy(() => import('./apps/htaccess-generator/App'));
const RateLimitCalculator = lazy(() => import('./apps/rate-limit-calculator/App'));
const ApiEndpointPlanner = lazy(() => import('./apps/api-endpoint-planner/App'));
const MetaTagGenerator = lazy(() => import('./apps/meta-tag-generator/App'));
const FaviconGenerator = lazy(() => import('./apps/favicon-generator/App'));
const RobotsTxtGenerator = lazy(() => import('./apps/robots-txt-generator/App'));
const CssGridGenerator = lazy(() => import('./apps/css-grid-generator/App'));

// Frontend & Design Tools
const CssFlexboxPlayground = lazy(() => import('./apps/css-flexbox-playground/App'));
const AnimationBuilder = lazy(() => import('./apps/animation-builder/App'));
const ResponsiveBreakpointTester = lazy(() => import('./apps/responsive-breakpoint-tester/App'));
const ImageToBase64 = lazy(() => import('./apps/image-to-base64/App'));

// Database Tools
const CassandraCqlBuilder = lazy(() => import('./apps/cassandra-cql-builder/App'));
const DynamodbTableDesigner = lazy(() => import('./apps/dynamodb-table-designer/App'));
const DatabaseIndexAdvisor = lazy(() => import('./apps/database-index-advisor/App'));
const DataMaskingTool = lazy(() => import('./apps/data-masking-tool/App'));

// Project & Workflow Tools
const ConventionalCommitBuilder = lazy(() => import('./apps/conventional-commit-builder/App'));
const ChangelogGenerator = lazy(() => import('./apps/changelog-generator/App'));
const ReadmeGenerator = lazy(() => import('./apps/readme-generator/App'));
const LicensePicker = lazy(() => import('./apps/license-picker/App'));
const SemverCalculator = lazy(() => import('./apps/semver-calculator/App'));
const SprintPlanner = lazy(() => import('./apps/sprint-planner/App'));

// Reference & Learning Tools
const DependencyMatrix = lazy(() => import('./apps/dependency-matrix/App'));
const LinuxCommandReference = lazy(() => import('./apps/linux-command-reference/App'));
const DockerCommandReference = lazy(() => import('./apps/docker-command-reference/App'));
const DesignPatternsReference = lazy(() => import('./apps/design-patterns-reference/App'));
const KeyboardShortcutReference = lazy(() => import('./apps/keyboard-shortcut-reference/App'));
const PlantumlEditor = lazy(() => import('./apps/plantuml-editor/App'));
const LogFormatParser = lazy(() => import('./apps/log-format-parser/App'));
const CrontabValidator = lazy(() => import('./apps/crontab-validator/App'));
const GrokParser = lazy(() => import('./apps/grok-parser/App'));
const JavaCodeGenerator = lazy(() => import('./apps/java-code-generator/App'));

// GeoServer & GIS Tools
const GeoServerRestBuilder = lazy(() => import('./apps/geoserver-rest-builder/App'));
const SldStyleGenerator = lazy(() => import('./apps/sld-style-generator/App'));
const CqlFilterBuilder = lazy(() => import('./apps/cql-filter-builder/App'));

// OGC & ArcGIS Tools
const WmsWfsBuilder = lazy(() => import('./apps/wms-wfs-builder/App'));
const ArcGISQueryBuilder = lazy(() => import('./apps/arcgis-query-builder/App'));
const ArcGISServiceUrl = lazy(() => import('./apps/arcgis-service-url/App'));

// GIS Utilities & Converters
const ArcadeExpressionBuilder = lazy(() => import('./apps/arcade-expression-builder/App'));
const GeoJsonEditor = lazy(() => import('./apps/geojson-editor/App'));
const CoordinateConverter = lazy(() => import('./apps/coordinate-converter/App'));
const BboxGenerator = lazy(() => import('./apps/bbox-generator/App'));
const PostgisQueryBuilder = lazy(() => import('./apps/postgis-query-builder/App'));
const WktGeojsonConverter = lazy(() => import('./apps/wkt-geojson-converter/App'));
const MapTileUrlBuilder = lazy(() => import('./apps/map-tile-url-builder/App'));
const EpsgCrsReference = lazy(() => import('./apps/epsg-crs-reference/App'));
const ShapefileStyleBuilder = lazy(() => import('./apps/shapefile-style-builder/App'));

// Government Forms & Calculators
const LtcClaimCalculator = lazy(() => import('./apps/ltc-claim-calculator/App'));
const TaDaCalculator = lazy(() => import('./apps/ta-da-calculator/App'));
const TransferTaCalculator = lazy(() => import('./apps/transfer-ta-calculator/App'));
const FestivalAdvanceCalc = lazy(() => import('./apps/festival-advance-calc/App'));
const PayFixationCalculator = lazy(() => import('./apps/pay-fixation-calculator/App'));
const PayLevelMatrix = lazy(() => import('./apps/pay-level-matrix/App'));
const GovtSalarySlip = lazy(() => import('./apps/govt-salary-slip/App'));
const DaRateLookup = lazy(() => import('./apps/da-rate-lookup/App'));
const PensionGratuityCalculator = lazy(() => import('./apps/pension-gratuity-calculator/App'));
const RetirementPlanner = lazy(() => import('./apps/retirement-planner/App'));
const GpfCalculator = lazy(() => import('./apps/gpf-calculator/App'));
const NpsTracker = lazy(() => import('./apps/nps-tracker/App'));
const IncomeTaxCalculator = lazy(() => import('./apps/income-tax-calculator/App'));
const HraCalculator = lazy(() => import('./apps/hra-calculator/App'));
const CghsClaimForm = lazy(() => import('./apps/cghs-claim-form/App'));
const GisCgegisCalculator = lazy(() => import('./apps/gis-cgegis-calculator/App'));
const LeaveManager = lazy(() => import('./apps/leave-manager/App'));
const CeaReimbursement = lazy(() => import('./apps/cea-reimbursement/App'));
const PropertyReturnForm = lazy(() => import('./apps/property-return-form/App'));
const GovtFormReference = lazy(() => import('./apps/govt-form-reference/App'));
const FormToCodeGenerator = lazy(() => import('./apps/form-to-code-generator/App'));
const DynamicFormCreatorApp = lazy(() => import('./apps/dynamic-form-creator/App'));

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
        {/* Students & Learning Tools */}
        <Route path="/flashcard-maker/*" element={<FlashcardMaker />} />
        <Route path="/gpa-calculator/*" element={<GpaCalculator />} />
        <Route path="/citation-generator/*" element={<CitationGenerator />} />
        <Route path="/algorithm-visualizer/*" element={<AlgorithmVisualizer />} />
        <Route path="/data-structure-visualizer/*" element={<DataStructureVisualizer />} />
        <Route path="/latex-math-editor/*" element={<LatexMathEditor />} />
        <Route path="/code-snippet-runner/*" element={<CodeSnippetRunner />} />
        <Route path="/typing-speed-test/*" element={<TypingSpeedTest />} />
        <Route path="/number-base-converter/*" element={<NumberBaseConverter />} />
        <Route path="/bitwise-calculator/*" element={<BitwiseCalculator />} />
        <Route path="/big-o-cheatsheet/*" element={<BigOCheatsheet />} />
        <Route path="/periodic-table/*" element={<PeriodicTable />} />
        {/* Developer Tools (new) */}
        <Route path="/git-command-builder/*" element={<GitCommandBuilder />} />
        <Route path="/chmod-calculator/*" element={<ChmodCalculator />} />
        <Route path="/http-status-reference/*" element={<HttpStatusReference />} />
        <Route path="/code-screenshot/*" element={<CodeScreenshot />} />
        <Route path="/svg-editor/*" element={<SvgEditor />} />
        <Route path="/html-css-playground/*" element={<HtmlCssPlayground />} />
        <Route path="/code-formatter/*" element={<CodeFormatter />} />
        <Route path="/webhook-tester/*" element={<WebhookTester />} />
        <Route path="/package-json-generator/*" element={<PackageJsonGenerator />} />
        <Route path="/env-editor/*" element={<EnvEditor />} />
        <Route path="/ascii-art-generator/*" element={<AsciiArtGenerator />} />
        <Route path="/network-port-reference/*" element={<NetworkPortReference />} />
        <Route path="/xml-formatter/*" element={<XmlFormatter />} />
        <Route path="/json-csv-converter/*" element={<JsonCsvConverter />} />
        <Route path="/encoding-converter/*" element={<EncodingConverter />} />
        {/* Office & Productivity Tools (new) */}
        <Route path="/gantt-chart/*" element={<GanttChart />} />
        <Route path="/mind-map/*" element={<MindMap />} />
        <Route path="/presentation-timer/*" element={<PresentationTimer />} />
        <Route path="/meeting-scheduler/*" element={<MeetingScheduler />} />
        <Route path="/email-template-builder/*" element={<EmailTemplateBuilder />} />
        <Route path="/habit-tracker/*" element={<HabitTracker />} />
        <Route path="/daily-planner/*" element={<DailyPlanner />} />
        <Route path="/whiteboard/*" element={<Whiteboard />} />
        <Route path="/csv-viewer/*" element={<CsvViewer />} />
        <Route path="/agenda-builder/*" element={<AgendaBuilder />} />
        <Route path="/receipt-scanner/*" element={<ReceiptScanner />} />
        <Route path="/loan-calculator/*" element={<LoanCalculator />} />
        <Route path="/spreadsheet-formula-ref/*" element={<SpreadsheetFormulaRef />} />
        {/* General Utility Tools (new) */}
        <Route path="/scientific-calculator/*" element={<ScientificCalculator />} />
        <Route path="/barcode-generator/*" element={<BarcodeGenerator />} />
        <Route path="/text-diff-merger/*" element={<TextDiffMerger />} />
        <Route path="/morse-code-converter/*" element={<MorseCodeConverter />} />
        <Route path="/ocr-tool/*" element={<OcrTool />} />
        <Route path="/color-blindness-simulator/*" element={<ColorBlindnessSimulator />} />
        <Route path="/font-preview/*" element={<FontPreview />} />
        <Route path="/aspect-ratio-calculator/*" element={<AspectRatioCalculator />} />
        <Route path="/readability-analyzer/*" element={<ReadabilityAnalyzer />} />
        <Route path="/privacy-redactor/*" element={<PrivacyRedactor />} />
        {/* DevOps & Infrastructure Tools */}
        <Route path="/helm-chart-builder/*" element={<HelmChartBuilder />} />
        <Route path="/ansible-playbook-builder/*" element={<AnsiblePlaybookBuilder />} />
        <Route path="/prometheus-query-builder/*" element={<PrometheusQueryBuilder />} />
        <Route path="/grafana-dashboard-builder/*" element={<GrafanaDashboardBuilder />} />
        <Route path="/vagrant-file-builder/*" element={<VagrantFileBuilder />} />
        <Route path="/systemd-service-builder/*" element={<SystemdServiceBuilder />} />
        <Route path="/shell-script-generator/*" element={<ShellScriptGenerator />} />
        {/* Code Converters */}
        <Route path="/curl-to-code/*" element={<CurlToCode />} />
        <Route path="/html-to-jsx/*" element={<HtmlToJsx />} />
        <Route path="/css-to-tailwind/*" element={<CssToTailwind />} />
        <Route path="/json-to-typescript/*" element={<JsonToTypescript />} />
        <Route path="/json-schema-generator/*" element={<JsonSchemaGenerator />} />
        <Route path="/sql-to-nosql/*" element={<SqlToNosql />} />
        <Route path="/protobuf-builder/*" element={<ProtobufBuilder />} />
        {/* Security & Auth Tools */}
        <Route path="/aws-iam-policy-builder/*" element={<AwsIamPolicyBuilder />} />
        <Route path="/cors-config-builder/*" element={<CorsConfigBuilder />} />
        <Route path="/csp-header-builder/*" element={<CspHeaderBuilder />} />
        <Route path="/oauth2-flow-visualizer/*" element={<Oauth2FlowVisualizer />} />
        <Route path="/rbac-designer/*" element={<RbacDesigner />} />
        <Route path="/secret-generator/*" element={<SecretGenerator />} />
        <Route path="/kafka-config-builder/*" element={<KafkaConfigBuilder />} />
        <Route path="/rabbitmq-config-builder/*" element={<RabbitmqConfigBuilder />} />
        {/* API & Frontend Tools */}
        <Route path="/nginx-location-tester/*" element={<NginxLocationTester />} />
        <Route path="/htaccess-generator/*" element={<HtaccessGenerator />} />
        <Route path="/rate-limit-calculator/*" element={<RateLimitCalculator />} />
        <Route path="/api-endpoint-planner/*" element={<ApiEndpointPlanner />} />
        <Route path="/meta-tag-generator/*" element={<MetaTagGenerator />} />
        <Route path="/favicon-generator/*" element={<FaviconGenerator />} />
        <Route path="/robots-txt-generator/*" element={<RobotsTxtGenerator />} />
        <Route path="/css-grid-generator/*" element={<CssGridGenerator />} />
        {/* Frontend & Design Tools */}
        <Route path="/css-flexbox-playground/*" element={<CssFlexboxPlayground />} />
        <Route path="/animation-builder/*" element={<AnimationBuilder />} />
        <Route path="/responsive-breakpoint-tester/*" element={<ResponsiveBreakpointTester />} />
        <Route path="/image-to-base64/*" element={<ImageToBase64 />} />
        {/* Database Tools */}
        <Route path="/cassandra-cql-builder/*" element={<CassandraCqlBuilder />} />
        <Route path="/dynamodb-table-designer/*" element={<DynamodbTableDesigner />} />
        <Route path="/database-index-advisor/*" element={<DatabaseIndexAdvisor />} />
        <Route path="/data-masking-tool/*" element={<DataMaskingTool />} />
        {/* Project & Workflow Tools */}
        <Route path="/conventional-commit-builder/*" element={<ConventionalCommitBuilder />} />
        <Route path="/changelog-generator/*" element={<ChangelogGenerator />} />
        <Route path="/readme-generator/*" element={<ReadmeGenerator />} />
        <Route path="/license-picker/*" element={<LicensePicker />} />
        <Route path="/semver-calculator/*" element={<SemverCalculator />} />
        <Route path="/sprint-planner/*" element={<SprintPlanner />} />
        {/* Reference & Learning Tools */}
        <Route path="/dependency-matrix/*" element={<DependencyMatrix />} />
        <Route path="/linux-command-reference/*" element={<LinuxCommandReference />} />
        <Route path="/docker-command-reference/*" element={<DockerCommandReference />} />
        <Route path="/design-patterns-reference/*" element={<DesignPatternsReference />} />
        <Route path="/keyboard-shortcut-reference/*" element={<KeyboardShortcutReference />} />
        <Route path="/plantuml-editor/*" element={<PlantumlEditor />} />
        <Route path="/log-format-parser/*" element={<LogFormatParser />} />
        <Route path="/crontab-validator/*" element={<CrontabValidator />} />
        <Route path="/grok-parser/*" element={<GrokParser />} />
        <Route path="/java-code-generator/*" element={<JavaCodeGenerator />} />
        {/* GeoServer & GIS Tools */}
        <Route path="/geoserver-rest-builder/*" element={<GeoServerRestBuilder />} />
        <Route path="/sld-style-generator/*" element={<SldStyleGenerator />} />
        <Route path="/cql-filter-builder/*" element={<CqlFilterBuilder />} />
        {/* OGC & ArcGIS Tools */}
        <Route path="/wms-wfs-builder/*" element={<WmsWfsBuilder />} />
        <Route path="/arcgis-query-builder/*" element={<ArcGISQueryBuilder />} />
        <Route path="/arcgis-service-url/*" element={<ArcGISServiceUrl />} />
        {/* GIS Utilities & Converters */}
        <Route path="/arcade-expression-builder/*" element={<ArcadeExpressionBuilder />} />
        <Route path="/geojson-editor/*" element={<GeoJsonEditor />} />
        <Route path="/coordinate-converter/*" element={<CoordinateConverter />} />
        <Route path="/bbox-generator/*" element={<BboxGenerator />} />
        <Route path="/postgis-query-builder/*" element={<PostgisQueryBuilder />} />
        <Route path="/wkt-geojson-converter/*" element={<WktGeojsonConverter />} />
        <Route path="/map-tile-url-builder/*" element={<MapTileUrlBuilder />} />
        <Route path="/epsg-crs-reference/*" element={<EpsgCrsReference />} />
        <Route path="/shapefile-style-builder/*" element={<ShapefileStyleBuilder />} />
        {/* Government Forms & Calculators */}
        <Route path="/ltc-claim-calculator/*" element={<LtcClaimCalculator />} />
        <Route path="/ta-da-calculator/*" element={<TaDaCalculator />} />
        <Route path="/transfer-ta-calculator/*" element={<TransferTaCalculator />} />
        <Route path="/festival-advance-calc/*" element={<FestivalAdvanceCalc />} />
        <Route path="/pay-fixation-calculator/*" element={<PayFixationCalculator />} />
        <Route path="/pay-level-matrix/*" element={<PayLevelMatrix />} />
        <Route path="/govt-salary-slip/*" element={<GovtSalarySlip />} />
        <Route path="/da-rate-lookup/*" element={<DaRateLookup />} />
        <Route path="/pension-gratuity-calculator/*" element={<PensionGratuityCalculator />} />
        <Route path="/retirement-planner/*" element={<RetirementPlanner />} />
        <Route path="/gpf-calculator/*" element={<GpfCalculator />} />
        <Route path="/nps-tracker/*" element={<NpsTracker />} />
        <Route path="/income-tax-calculator/*" element={<IncomeTaxCalculator />} />
        <Route path="/hra-calculator/*" element={<HraCalculator />} />
        <Route path="/cghs-claim-form/*" element={<CghsClaimForm />} />
        <Route path="/gis-cgegis-calculator/*" element={<GisCgegisCalculator />} />
        <Route path="/leave-manager/*" element={<LeaveManager />} />
        <Route path="/cea-reimbursement/*" element={<CeaReimbursement />} />
        <Route path="/property-return-form/*" element={<PropertyReturnForm />} />
        <Route path="/govt-form-reference/*" element={<GovtFormReference />} />
        <Route path="/form-to-code-generator/*" element={<FormToCodeGenerator />} />
        <Route path="/dynamic-form-creator/*" element={<DynamicFormCreatorApp />} />
      </Routes>
    </Suspense>
  );
}

export default App;
