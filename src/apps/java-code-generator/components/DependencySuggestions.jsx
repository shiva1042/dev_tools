import { Lightbulb, Plus, ArrowRight } from 'lucide-react';
import { modules } from '../templates';

// Template dependencies - suggests related templates
const DEPENDENCIES = {
  // REST API dependencies
  'REST_API:CRUD_CONTROLLER': [
    { module: 'TESTING', type: 'CONTROLLER_TEST', reason: 'Test your controller' },
    { module: 'CONFIG', type: 'CORS_CONFIG', reason: 'Enable cross-origin requests' },
    { module: 'POSTGRESQL', type: 'REPOSITORY', reason: 'Add data persistence' },
  ],
  'REST_API:PAGINATION': [
    { module: 'POSTGRESQL', type: 'SPECIFICATION', reason: 'Add dynamic filtering' },
  ],

  // Security dependencies
  'SECURITY:SECURITY_CONFIG': [
    { module: 'SECURITY', type: 'JWT_SERVICE', reason: 'Add JWT authentication' },
    { module: 'SECURITY', type: 'AUTH_CONTROLLER', reason: 'Add login/register endpoints' },
  ],
  'SECURITY:JWT_SERVICE': [
    { module: 'SECURITY', type: 'AUTH_CONTROLLER', reason: 'Add authentication endpoints' },
  ],

  // Database dependencies
  'POSTGRESQL:ENTITY': [
    { module: 'POSTGRESQL', type: 'REPOSITORY', reason: 'Add CRUD operations' },
    { module: 'REST_API', type: 'CRUD_CONTROLLER', reason: 'Expose via REST API' },
  ],
  'POSTGRESQL:REPOSITORY': [
    { module: 'POSTGRESQL', type: 'SPECIFICATION', reason: 'Add dynamic queries' },
    { module: 'TESTING', type: 'INTEGRATION_TEST', reason: 'Test repository' },
  ],

  // WebSocket dependencies
  'WEBSOCKET:WEBSOCKET_CONFIG': [
    { module: 'WEBSOCKET', type: 'MESSAGE_HANDLER', reason: 'Handle messages' },
    { module: 'CONFIG', type: 'CORS_CONFIG', reason: 'Configure CORS for WS' },
  ],

  // Chatbot dependencies
  'CHATBOT:CHATBOT_SERVICE': [
    { module: 'CHATBOT', type: 'CHATBOT_CONTROLLER', reason: 'Add REST endpoint' },
    { module: 'CHATBOT', type: 'SESSION_MANAGER', reason: 'Manage chat sessions' },
  ],

  // Spring Boot dependencies
  'SPRING_BOOT:MAIN_APPLICATION': [
    { module: 'SPRING_BOOT', type: 'APPLICATION_YML', reason: 'Add configuration' },
    { module: 'CONFIG', type: 'CORS_CONFIG', reason: 'Enable CORS' },
  ],

  // Testing dependencies
  'TESTING:JUNIT_TEST': [
    { module: 'TESTING', type: 'MOCKITO_TEST', reason: 'Add mocking capabilities' },
  ],
  'TESTING:INTEGRATION_TEST': [
    { module: 'CONFIG', type: 'ASYNC_CONFIG', reason: 'For async testing' },
  ],

  // Microservices dependencies
  'MICROSERVICES:circuitBreaker': [
    { module: 'MICROSERVICES', type: 'rateLimiter', reason: 'Add rate limiting' },
    { module: 'MICROSERVICES', type: 'healthCheck', reason: 'Add health endpoints' },
    { module: 'CACHING', type: 'redisService', reason: 'Add distributed cache' },
  ],
  'MICROSERVICES:serviceDiscovery': [
    { module: 'MICROSERVICES', type: 'distributedTracing', reason: 'Add request tracing' },
  ],

  // Messaging dependencies
  'MESSAGING:kafkaProducer': [
    { module: 'MESSAGING', type: 'kafkaConsumer', reason: 'Consume the messages' },
    { module: 'ASYNC', type: 'eventDrivenService', reason: 'Event-driven architecture' },
  ],
  'MESSAGING:eventSourcing': [
    { module: 'MESSAGING', type: 'sagaPattern', reason: 'Manage distributed transactions' },
  ],

  // Caching dependencies
  'CACHING:redisService': [
    { module: 'CACHING', type: 'distributedLock', reason: 'Add distributed locking' },
    { module: 'CACHING', type: 'cacheAsidePattern', reason: 'Implement cache-aside' },
  ],

  // Reactive dependencies
  'REACTIVE:webfluxController': [
    { module: 'REACTIVE', type: 'webfluxService', reason: 'Add business logic layer' },
    { module: 'REACTIVE', type: 'r2dbcRepository', reason: 'Reactive data access' },
  ],
  'REACTIVE:webfluxService': [
    { module: 'REACTIVE', type: 'webClient', reason: 'Call external services' },
    { module: 'CACHING', type: 'redisService', reason: 'Add reactive caching' },
  ],
  'REACTIVE:r2dbcRepository': [
    { module: 'REACTIVE', type: 'r2dbcEntity', reason: 'Define entity mapping' },
  ],

  // Scheduling dependencies
  'SCHEDULING:scheduledTask': [
    { module: 'SCHEDULING', type: 'schedulerConfig', reason: 'Configure thread pool' },
    { module: 'ASYNC', type: 'asyncConfig', reason: 'Enable async execution' },
  ],
  'SCHEDULING:batchProcessor': [
    { module: 'SCHEDULING', type: 'jobListener', reason: 'Monitor job execution' },
  ],
  'SCHEDULING:quartzJob': [
    { module: 'SCHEDULING', type: 'schedulerConfig', reason: 'Configure scheduler' },
  ],

  // File handling dependencies
  'FILE_HANDLING:fileUploadController': [
    { module: 'FILE_HANDLING', type: 'fileService', reason: 'Add file storage logic' },
    { module: 'FILE_HANDLING', type: 'fileMetadataEntity', reason: 'Store file metadata' },
    { module: 'VALIDATION', type: 'customValidators', reason: 'Validate file types' },
  ],
  'FILE_HANDLING:fileService': [
    { module: 'FILE_HANDLING', type: 's3Service', reason: 'Store in S3' },
    { module: 'FILE_HANDLING', type: 'fileDownloadController', reason: 'Add download endpoint' },
  ],

  // Async dependencies
  'ASYNC:completableFutureService': [
    { module: 'ASYNC', type: 'asyncConfig', reason: 'Configure async executors' },
  ],
  'ASYNC:virtualThreadService': [
    { module: 'ASYNC', type: 'parallelStreamService', reason: 'Parallel processing' },
  ],
  'ASYNC:eventDrivenService': [
    { module: 'MESSAGING', type: 'kafkaProducer', reason: 'Publish events to Kafka' },
  ],

  // Validation dependencies
  'VALIDATION:customValidators': [
    { module: 'VALIDATION', type: 'validationGroups', reason: 'Group validations' },
    { module: 'VALIDATION', type: 'crossFieldValidation', reason: 'Validate multiple fields' },
  ],
};

export default function DependencySuggestions({
  selectedModule,
  selectedTemplateTypes,
  allSelectedTemplates = [], // Array of "MODULE:TYPE" strings
  onAddTemplate,
  className = ''
}) {
  // Get suggestions based on current selection
  const getSuggestions = () => {
    const suggestions = new Map();

    // Check current module's templates
    selectedTemplateTypes.forEach(type => {
      const key = `${selectedModule}:${type}`;
      const deps = DEPENDENCIES[key];
      if (deps) {
        deps.forEach(dep => {
          const depKey = `${dep.module}:${dep.type}`;
          // Don't suggest already selected templates
          if (!allSelectedTemplates.includes(depKey) &&
              !(selectedModule === dep.module && selectedTemplateTypes.includes(dep.type))) {
            suggestions.set(depKey, dep);
          }
        });
      }
    });

    return Array.from(suggestions.values());
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  // Get template display name
  const getTemplateName = (module, type) => {
    const mod = modules.find(m => m.module === module);
    if (!mod) return type;
    const template = mod.templates[type];
    return template?.name || type;
  };

  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200
                    dark:border-amber-800 p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Suggested Templates
        </span>
      </div>

      <div className="space-y-2">
        {suggestions.slice(0, 3).map(suggestion => (
          <div
            key={`${suggestion.module}:${suggestion.type}`}
            className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800
                     rounded-lg border border-amber-100 dark:border-slate-700"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {getTemplateName(suggestion.module, suggestion.type)}
                </span>
                <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {suggestion.module.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {suggestion.reason}
              </div>
            </div>
            <button
              onClick={() => onAddTemplate(suggestion.module, suggestion.type)}
              className="flex-shrink-0 p-1.5 bg-amber-100 dark:bg-amber-800/50 text-amber-700
                       dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800
                       transition-colors"
              title="Add this template"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {suggestions.length > 3 && (
        <div className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
          +{suggestions.length - 3} more suggestions available
        </div>
      )}
    </div>
  );
}
