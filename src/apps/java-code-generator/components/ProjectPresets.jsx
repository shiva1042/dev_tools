import { Rocket, Database, Shield, Bot, Zap, Server, Globe, TestTube, Radio, Clock, FileText, Layers } from 'lucide-react';

// Pre-configured project presets
export const PRESETS = [
  {
    id: 'rest-api-crud',
    name: 'REST API Starter',
    description: 'Complete REST API with CRUD, validation, and error handling',
    icon: Globe,
    color: 'bg-green-500',
    config: {
      modules: ['REST_API', 'CONFIG', 'TESTING'],
      templates: {
        REST_API: ['CRUD_CONTROLLER', 'PAGINATION', 'GLOBAL_EXCEPTION_HANDLER'],
        CONFIG: ['CORS_CONFIG', 'ASYNC_CONFIG'],
        TESTING: ['CONTROLLER_TEST', 'INTEGRATION_TEST']
      }
    }
  },
  {
    id: 'microservice',
    name: 'Microservice',
    description: 'Production-ready microservice with security and monitoring',
    icon: Server,
    color: 'bg-indigo-500',
    config: {
      modules: ['SPRING_BOOT', 'REST_API', 'SECURITY', 'CONFIG'],
      templates: {
        SPRING_BOOT: ['MAIN_APPLICATION', 'APPLICATION_YML'],
        REST_API: ['CRUD_CONTROLLER', 'RESPONSE_WRAPPER'],
        SECURITY: ['SECURITY_CONFIG', 'JWT_SERVICE'],
        CONFIG: ['CORS_CONFIG', 'ASYNC_CONFIG']
      }
    }
  },
  {
    id: 'database-service',
    name: 'Database Service',
    description: 'JPA entities, repositories, and specifications',
    icon: Database,
    color: 'bg-blue-500',
    config: {
      modules: ['POSTGRESQL', 'REST_API'],
      templates: {
        POSTGRESQL: ['ENTITY', 'REPOSITORY', 'SPECIFICATION', 'BATCH_OPERATIONS'],
        REST_API: ['CRUD_CONTROLLER', 'PAGINATION']
      }
    }
  },
  {
    id: 'secure-api',
    name: 'Secure API',
    description: 'JWT authentication with role-based access control',
    icon: Shield,
    color: 'bg-red-500',
    config: {
      modules: ['SECURITY', 'REST_API', 'CONFIG'],
      templates: {
        SECURITY: ['SECURITY_CONFIG', 'JWT_SERVICE', 'AUTH_CONTROLLER'],
        REST_API: ['CRUD_CONTROLLER', 'GLOBAL_EXCEPTION_HANDLER'],
        CONFIG: ['CORS_CONFIG']
      }
    }
  },
  {
    id: 'chatbot-service',
    name: 'AI Chatbot',
    description: 'Conversational AI with session management',
    icon: Bot,
    color: 'bg-purple-500',
    config: {
      modules: ['CHATBOT', 'WEBSOCKET', 'CONFIG'],
      templates: {
        CHATBOT: ['CHATBOT_SERVICE', 'CHATBOT_CONTROLLER', 'SESSION_MANAGER'],
        WEBSOCKET: ['WEBSOCKET_CONFIG', 'MESSAGE_HANDLER'],
        CONFIG: ['CORS_CONFIG', 'ASYNC_CONFIG']
      }
    }
  },
  {
    id: 'realtime-app',
    name: 'Real-time App',
    description: 'WebSocket communication with STOMP',
    icon: Zap,
    color: 'bg-yellow-500',
    config: {
      modules: ['WEBSOCKET', 'CONFIG', 'REST_API'],
      templates: {
        WEBSOCKET: ['WEBSOCKET_CONFIG', 'MESSAGE_HANDLER', 'STOMP_CONTROLLER'],
        CONFIG: ['CORS_CONFIG', 'ASYNC_CONFIG'],
        REST_API: ['CRUD_CONTROLLER']
      }
    }
  },
  {
    id: 'test-suite',
    name: 'Test Suite',
    description: 'Comprehensive testing setup with mocks and containers',
    icon: TestTube,
    color: 'bg-pink-500',
    config: {
      modules: ['TESTING', 'CONFIG'],
      templates: {
        TESTING: ['JUNIT_TEST', 'MOCKITO_TEST', 'INTEGRATION_TEST', 'CONTROLLER_TEST'],
        CONFIG: ['ASYNC_CONFIG']
      }
    }
  },
  {
    id: 'full-stack',
    name: 'Full Stack',
    description: 'Complete backend with all essential features',
    icon: Rocket,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    config: {
      modules: ['SPRING_BOOT', 'REST_API', 'POSTGRESQL', 'SECURITY', 'CONFIG', 'TESTING'],
      templates: {
        SPRING_BOOT: ['MAIN_APPLICATION', 'APPLICATION_YML', 'POM_XML'],
        REST_API: ['CRUD_CONTROLLER', 'PAGINATION', 'GLOBAL_EXCEPTION_HANDLER'],
        POSTGRESQL: ['ENTITY', 'REPOSITORY'],
        SECURITY: ['SECURITY_CONFIG', 'JWT_SERVICE'],
        CONFIG: ['CORS_CONFIG', 'ASYNC_CONFIG'],
        TESTING: ['JUNIT_TEST', 'INTEGRATION_TEST']
      }
    }
  },
  {
    id: 'reactive-service',
    name: 'Reactive Service',
    description: 'WebFlux with R2DBC for reactive data access',
    icon: Radio,
    color: 'bg-fuchsia-500',
    config: {
      modules: ['REACTIVE', 'CACHING', 'CONFIG'],
      templates: {
        REACTIVE: ['webfluxController', 'webfluxService', 'r2dbcRepository', 'r2dbcEntity', 'webClient'],
        CACHING: ['redisService', 'cacheAsidePattern'],
        CONFIG: ['ASYNC_CONFIG']
      }
    }
  },
  {
    id: 'event-driven',
    name: 'Event Driven',
    description: 'Kafka/RabbitMQ messaging with event sourcing',
    icon: Layers,
    color: 'bg-rose-500',
    config: {
      modules: ['MESSAGING', 'MICROSERVICES', 'ASYNC'],
      templates: {
        MESSAGING: ['kafkaProducer', 'kafkaConsumer', 'eventSourcing', 'sagaPattern'],
        MICROSERVICES: ['circuitBreaker', 'rateLimiter'],
        ASYNC: ['eventDrivenService', 'completableFutureService']
      }
    }
  },
  {
    id: 'batch-processing',
    name: 'Batch Processing',
    description: 'Scheduled tasks with Spring Batch and Quartz',
    icon: Clock,
    color: 'bg-sky-500',
    config: {
      modules: ['SCHEDULING', 'ASYNC', 'FILE_HANDLING'],
      templates: {
        SCHEDULING: ['scheduledTask', 'batchProcessor', 'jobListener', 'quartzJob'],
        ASYNC: ['virtualThreadService', 'parallelStreamService'],
        FILE_HANDLING: ['csvExporter']
      }
    }
  },
  {
    id: 'file-service',
    name: 'File Service',
    description: 'File upload, download, S3 storage',
    icon: FileText,
    color: 'bg-stone-500',
    config: {
      modules: ['FILE_HANDLING', 'REST_API', 'VALIDATION'],
      templates: {
        FILE_HANDLING: ['fileUploadController', 'fileDownloadController', 'fileService', 's3Service', 'fileMetadataEntity'],
        REST_API: ['GLOBAL_EXCEPTION_HANDLER'],
        VALIDATION: ['customValidators']
      }
    }
  }
];

export default function ProjectPresets({ onSelectPreset, className = '' }) {
  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Quick Start Presets
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map(preset => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="flex items-start gap-2 p-2.5 rounded-lg border border-gray-200
                         dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600
                         bg-white dark:bg-slate-800 hover:shadow-md transition-all text-left group"
            >
              <div className={`p-1.5 rounded-lg ${preset.color} text-white flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate
                              group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {preset.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {preset.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
