// Template Module Configuration
// All templates are pure JavaScript - no backend needed!

import { coreJavaTemplates } from './coreJava';
import { chatbotTemplates } from './chatbot';
import { restApiTemplates } from './restApi';
import { jsonProcessingTemplates } from './jsonProcessing';
import { configTemplates } from './config';
import { testingTemplates } from './testing';
import { springBootTemplates } from './springBoot';
import { websocketTemplates } from './websocket';
import { securityTemplates } from './security';
import { postgresqlTemplates } from './postgresql';
import { elasticsearchTemplates } from './elasticsearch';
import { neo4jTemplates } from './neo4j';
import { microservicesTemplates } from './microservices';
import { messagingTemplates } from './messaging';
import { cachingTemplates } from './caching';
import { validationTemplates } from './validation';
import { reactiveTemplates } from './reactive';
import { schedulingTemplates } from './scheduling';
import { fileHandlingTemplates } from './fileHandling';
import { asyncTemplates } from './async';

// Module definitions
export const modules = [
  {
    module: 'CORE_JAVA',
    displayName: 'Core Java',
    description: 'Java 21 patterns, loops, conditionals, design patterns',
    icon: 'code',
    templates: coreJavaTemplates
  },
  {
    module: 'POSTGRESQL',
    displayName: 'PostgreSQL / JPA',
    description: 'JPA entities, repositories, specifications, batch operations, JSONB',
    icon: 'database',
    templates: postgresqlTemplates
  },
  {
    module: 'ELASTICSEARCH',
    displayName: 'Elasticsearch',
    description: 'ES client, documents, search, aggregations, geo queries, scroll',
    icon: 'search',
    templates: elasticsearchTemplates
  },
  {
    module: 'NEO4J',
    displayName: 'Neo4j',
    description: 'Graph nodes, relationships, Cypher queries, traversals, pathfinding',
    icon: 'graph',
    templates: neo4jTemplates
  },
  {
    module: 'CHATBOT',
    displayName: 'Chatbot',
    description: 'AI Chatbot and conversational UI templates',
    icon: 'bot',
    templates: chatbotTemplates
  },
  {
    module: 'REST_API',
    displayName: 'REST API',
    description: 'REST controllers, pagination, validation, file handling',
    icon: 'api',
    templates: restApiTemplates
  },
  {
    module: 'JSON_PROCESSING',
    displayName: 'JSON Processing',
    description: 'Jackson, JsonNode, streaming, transformations',
    icon: 'json',
    templates: jsonProcessingTemplates
  },
  {
    module: 'CONFIG',
    displayName: 'Configuration',
    description: 'Spring configs, security, CORS, async, caching',
    icon: 'settings',
    templates: configTemplates
  },
  {
    module: 'TESTING',
    displayName: 'Testing',
    description: 'JUnit 5, integration tests, mocking, testcontainers',
    icon: 'test',
    templates: testingTemplates
  },
  {
    module: 'SPRING_BOOT',
    displayName: 'Spring Boot',
    description: 'Starter templates, application.yml, logging',
    icon: 'spring',
    templates: springBootTemplates
  },
  {
    module: 'WEBSOCKET',
    displayName: 'WebSocket',
    description: 'Real-time communication templates',
    icon: 'socket',
    templates: websocketTemplates
  },
  {
    module: 'SECURITY',
    displayName: 'Security',
    description: 'Authentication, authorization, JWT templates',
    icon: 'shield',
    templates: securityTemplates
  },
  {
    module: 'MICROSERVICES',
    displayName: 'Microservices',
    description: 'Circuit breaker, rate limiting, service discovery, distributed tracing',
    icon: 'grid',
    templates: microservicesTemplates
  },
  {
    module: 'MESSAGING',
    displayName: 'Messaging',
    description: 'Kafka, RabbitMQ, event sourcing, saga patterns',
    icon: 'message',
    templates: messagingTemplates
  },
  {
    module: 'CACHING',
    displayName: 'Caching',
    description: 'Redis, Caffeine, cache-aside pattern, distributed locks',
    icon: 'zap',
    templates: cachingTemplates
  },
  {
    module: 'VALIDATION',
    displayName: 'Validation',
    description: 'Custom validators, validation groups, cross-field validation',
    icon: 'check',
    templates: validationTemplates
  },
  {
    module: 'REACTIVE',
    displayName: 'Reactive / WebFlux',
    description: 'WebFlux controllers, R2DBC, WebClient, Flux operators',
    icon: 'activity',
    templates: reactiveTemplates
  },
  {
    module: 'SCHEDULING',
    displayName: 'Scheduling',
    description: 'Scheduled tasks, cron jobs, Spring Batch, Quartz',
    icon: 'clock',
    templates: schedulingTemplates
  },
  {
    module: 'FILE_HANDLING',
    displayName: 'File Handling',
    description: 'File upload/download, S3 integration, CSV export',
    icon: 'file',
    templates: fileHandlingTemplates
  },
  {
    module: 'ASYNC',
    displayName: 'Async Patterns',
    description: 'CompletableFuture, Virtual Threads, parallel streams, events',
    icon: 'layers',
    templates: asyncTemplates
  }
];

// Get module by name
export const getModule = (moduleName) => {
  return modules.find(m => m.module === moduleName);
};

// Get templates for a module
export const getTemplateTypes = (moduleName) => {
  const module = getModule(moduleName);
  if (!module) return [];

  return Object.entries(module.templates).map(([key, template]) => ({
    type: key,
    displayName: template.name,
    description: template.description
  }));
};

// Generate templates
export const generateTemplates = (moduleName, templateTypes, className, packageName) => {
  const module = getModule(moduleName);
  if (!module) return { templates: [], folderStructure: {} };

  const templates = [];
  const folderStructure = {};

  templateTypes.forEach(type => {
    const templateDef = module.templates[type];
    if (templateDef) {
      const generated = templateDef.generate(className, packageName);
      templates.push(generated);

      // Build folder structure
      const packagePath = generated.packagePath || packageName;
      const basePath = packagePath === 'resources'
        ? 'src/main/resources'
        : `src/main/java/${packagePath.replace(/\./g, '/')}`;

      folderStructure[basePath] = 'directory';
      folderStructure[`${basePath}/${generated.fileName}`] = 'file';
    }
  });

  return {
    module: moduleName,
    className,
    packageName,
    templates,
    folderStructure
  };
};
