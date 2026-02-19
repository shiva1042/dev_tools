// Async Patterns Templates
// CompletableFuture, Virtual Threads, Async processing patterns

export const asyncTemplates = {
  completableFutureService: {
    name: 'CompletableFuture Service',
    description: 'Service using CompletableFuture for async operations',
    generate: (className, packageName) => ({
      fileName: `${className}AsyncService.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.concurrent.*;
import java.util.function.Supplier;

@Service
public class ${className}AsyncService {

    private static final Logger log = LoggerFactory.getLogger(${className}AsyncService.class);

    private final ${className}Repository repository;
    private final ${className}ExternalClient externalClient;
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    public ${className}AsyncService(${className}Repository repository,
                                    ${className}ExternalClient externalClient) {
        this.repository = repository;
        this.externalClient = externalClient;
    }

    // Basic async operation
    @Async
    public CompletableFuture<${className}> findByIdAsync(Long id) {
        log.debug("Finding ${className} by id asynchronously: {}", id);
        return CompletableFuture.supplyAsync(() -> repository.findById(id).orElse(null), executor);
    }

    // Chaining async operations
    public CompletableFuture<${className}Details> get${className}Details(Long id) {
        return findByIdAsync(id)
            .thenCompose(entity -> {
                if (entity == null) {
                    return CompletableFuture.completedFuture(null);
                }
                return enrichWithExternalData(entity);
            })
            .exceptionally(ex -> {
                log.error("Error getting details for id: {}", id, ex);
                return null;
            });
    }

    // Combining multiple async operations
    public CompletableFuture<${className}Summary> get${className}Summary(Long id) {
        CompletableFuture<${className}> entityFuture = findByIdAsync(id);
        CompletableFuture<${className}Stats> statsFuture = getStatsAsync(id);
        CompletableFuture<List<${className}Activity>> activitiesFuture = getRecentActivitiesAsync(id);

        return CompletableFuture.allOf(entityFuture, statsFuture, activitiesFuture)
            .thenApply(v -> new ${className}Summary(
                entityFuture.join(),
                statsFuture.join(),
                activitiesFuture.join()
            ));
    }

    // Either pattern - first to complete wins
    public CompletableFuture<${className}> findFromAnySource(Long id) {
        CompletableFuture<${className}> fromCache = CompletableFuture.supplyAsync(
            () -> findInCache(id), executor);
        CompletableFuture<${className}> fromDb = CompletableFuture.supplyAsync(
            () -> findInDatabase(id), executor);

        return fromCache.applyToEither(fromDb, entity -> entity);
    }

    // Timeout handling
    public CompletableFuture<${className}> findWithTimeout(Long id, long timeoutMs) {
        return findByIdAsync(id)
            .orTimeout(timeoutMs, TimeUnit.MILLISECONDS)
            .exceptionally(ex -> {
                if (ex.getCause() instanceof TimeoutException) {
                    log.warn("Timeout finding entity: {}", id);
                    return getFromFallback(id);
                }
                throw new CompletionException(ex);
            });
    }

    // Processing multiple items in parallel
    public CompletableFuture<List<${className}>> processMultiple(List<Long> ids) {
        List<CompletableFuture<${className}>> futures = ids.stream()
            .map(this::findByIdAsync)
            .toList();

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .filter(java.util.Objects::nonNull)
                .toList());
    }

    // With error handling per item
    public CompletableFuture<List<${className}Result>> processWithResults(List<Long> ids) {
        List<CompletableFuture<${className}Result>> futures = ids.stream()
            .map(id -> findByIdAsync(id)
                .thenApply(entity -> ${className}Result.success(id, entity))
                .exceptionally(ex -> ${className}Result.failure(id, ex.getMessage())))
            .toList();

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .toList());
    }

    // Retry pattern
    public <T> CompletableFuture<T> withRetry(Supplier<CompletableFuture<T>> operation,
                                               int maxRetries, long delayMs) {
        return operation.get()
            .exceptionallyCompose(ex -> {
                if (maxRetries > 0) {
                    log.warn("Operation failed, retrying... ({} retries left)", maxRetries);
                    return CompletableFuture.supplyAsync(() -> null,
                            CompletableFuture.delayedExecutor(delayMs, TimeUnit.MILLISECONDS))
                        .thenCompose(v -> withRetry(operation, maxRetries - 1, delayMs * 2));
                }
                return CompletableFuture.failedFuture(ex);
            });
    }

    // Helper methods
    private CompletableFuture<${className}Details> enrichWithExternalData(${className} entity) {
        return CompletableFuture.supplyAsync(() -> {
            var externalData = externalClient.fetchData(entity.getExternalId());
            return new ${className}Details(entity, externalData);
        }, executor);
    }

    private CompletableFuture<${className}Stats> getStatsAsync(Long id) {
        return CompletableFuture.supplyAsync(() -> repository.getStats(id), executor);
    }

    private CompletableFuture<List<${className}Activity>> getRecentActivitiesAsync(Long id) {
        return CompletableFuture.supplyAsync(() -> repository.findRecentActivities(id), executor);
    }

    private ${className} findInCache(Long id) { return null; /* Cache lookup */ }
    private ${className} findInDatabase(Long id) { return repository.findById(id).orElse(null); }
    private ${className} getFromFallback(Long id) { return new ${className}(); }

    // Result wrapper
    public record ${className}Result(Long id, ${className} entity, boolean success, String error) {
        public static ${className}Result success(Long id, ${className} entity) {
            return new ${className}Result(id, entity, true, null);
        }
        public static ${className}Result failure(Long id, String error) {
            return new ${className}Result(id, null, false, error);
        }
    }
}
`,
      language: 'java'
    })
  },

  virtualThreadService: {
    name: 'Virtual Thread Service',
    description: 'Service using Java 21 Virtual Threads',
    generate: (className, packageName) => ({
      fileName: `${className}VirtualThreadService.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.stream.IntStream;

@Service
public class ${className}VirtualThreadService {

    private static final Logger log = LoggerFactory.getLogger(${className}VirtualThreadService.class);

    private final ${className}Repository repository;

    // Virtual thread executor - lightweight threads managed by JVM
    private final ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();

    public ${className}VirtualThreadService(${className}Repository repository) {
        this.repository = repository;
    }

    // Simple virtual thread execution
    public void executeAsync(Runnable task) {
        Thread.startVirtualThread(task);
    }

    // Process items with virtual threads
    public List<${className}Result> processWithVirtualThreads(List<Long> ids) throws InterruptedException {
        List<${className}Result> results = new CopyOnWriteArrayList<>();

        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<${className}Result>> futures = ids.stream()
                .map(id -> executor.submit(() -> processItem(id)))
                .toList();

            for (Future<${className}Result> future : futures) {
                try {
                    results.add(future.get(30, TimeUnit.SECONDS));
                } catch (TimeoutException | ExecutionException e) {
                    log.error("Error processing item", e);
                }
            }
        }

        return results;
    }

    // Structured concurrency with StructuredTaskScope (Java 21)
    public ${className}AggregatedData fetchAggregatedData(Long id) throws InterruptedException {
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            StructuredTaskScope.Subtask<${className}> entityTask =
                scope.fork(() -> repository.findById(id).orElse(null));
            StructuredTaskScope.Subtask<${className}Stats> statsTask =
                scope.fork(() -> repository.getStats(id));
            StructuredTaskScope.Subtask<List<${className}Activity>> activitiesTask =
                scope.fork(() -> repository.findRecentActivities(id));

            scope.join();           // Wait for all tasks
            scope.throwIfFailed();  // Propagate exceptions

            return new ${className}AggregatedData(
                entityTask.get(),
                statsTask.get(),
                activitiesTask.get()
            );
        } catch (ExecutionException e) {
            throw new RuntimeException("Failed to fetch aggregated data", e);
        }
    }

    // First successful result wins
    public ${className} findFirstAvailable(Long id) throws InterruptedException {
        try (var scope = new StructuredTaskScope.ShutdownOnSuccess<${className}>()) {
            scope.fork(() -> findFromPrimarySource(id));
            scope.fork(() -> findFromSecondarySource(id));
            scope.fork(() -> findFromCache(id));

            scope.join();
            return scope.result();
        } catch (ExecutionException e) {
            throw new RuntimeException("All sources failed", e);
        }
    }

    // Batch processing with concurrency limit
    public List<${className}Result> batchProcess(List<Long> ids, int concurrencyLimit)
            throws InterruptedException {
        Semaphore semaphore = new Semaphore(concurrencyLimit);
        List<${className}Result> results = new CopyOnWriteArrayList<>();

        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<?>> futures = new ArrayList<>();

            for (Long id : ids) {
                Future<?> future = executor.submit(() -> {
                    try {
                        semaphore.acquire();
                        try {
                            results.add(processItem(id));
                        } finally {
                            semaphore.release();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                });
                futures.add(future);
            }

            for (Future<?> future : futures) {
                try {
                    future.get();
                } catch (ExecutionException e) {
                    log.error("Batch processing error", e);
                }
            }
        }

        return results;
    }

    // Performance comparison example
    public void performanceDemo() throws InterruptedException {
        int taskCount = 10000;
        List<Long> ids = IntStream.range(0, taskCount).mapToObj(Long::valueOf).toList();

        // Virtual threads
        Instant start = Instant.now();
        processWithVirtualThreads(ids);
        Duration virtualDuration = Duration.between(start, Instant.now());
        log.info("Virtual threads completed {} tasks in {} ms",
            taskCount, virtualDuration.toMillis());

        // Platform threads (for comparison)
        start = Instant.now();
        try (var executor = Executors.newFixedThreadPool(100)) {
            List<Future<${className}Result>> futures = ids.stream()
                .map(id -> executor.submit(() -> processItem(id)))
                .toList();
            for (Future<${className}Result> future : futures) {
                try {
                    future.get();
                } catch (ExecutionException e) {
                    // ignore
                }
            }
        }
        Duration platformDuration = Duration.between(start, Instant.now());
        log.info("Platform threads (100) completed {} tasks in {} ms",
            taskCount, platformDuration.toMillis());
    }

    // Helper methods
    private ${className}Result processItem(Long id) {
        try {
            // Simulate I/O operation
            Thread.sleep(10);
            ${className} entity = repository.findById(id).orElse(null);
            return ${className}Result.success(id, entity);
        } catch (Exception e) {
            return ${className}Result.failure(id, e.getMessage());
        }
    }

    private ${className} findFromPrimarySource(Long id) {
        return repository.findById(id).orElse(null);
    }

    private ${className} findFromSecondarySource(Long id) {
        return null; // Secondary source implementation
    }

    private ${className} findFromCache(Long id) {
        return null; // Cache implementation
    }

    public record ${className}AggregatedData(
        ${className} entity,
        ${className}Stats stats,
        List<${className}Activity> activities
    ) {}

    public record ${className}Result(Long id, ${className} entity, boolean success, String error) {
        public static ${className}Result success(Long id, ${className} entity) {
            return new ${className}Result(id, entity, true, null);
        }
        public static ${className}Result failure(Long id, String error) {
            return new ${className}Result(id, null, false, error);
        }
    }
}
`,
      language: 'java'
    })
  },

  asyncConfig: {
    name: 'Async Configuration',
    description: 'Configuration for async execution with executors',
    generate: (className, packageName) => ({
      fileName: `${className}AsyncConfig.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.lang.reflect.Method;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class ${className}AsyncConfig implements AsyncConfigurer {

    private static final Logger log = LoggerFactory.getLogger(${className}AsyncConfig.class);

    @Override
    @Bean(name = "taskExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("${className}Async-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean(name = "virtualThreadExecutor")
    public ExecutorService virtualThreadExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    @Bean(name = "ioExecutor")
    public Executor ioExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(20);
        executor.setMaxPoolSize(100);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("${className}IO-");
        executor.initialize();
        return executor;
    }

    @Bean(name = "cpuExecutor")
    public Executor cpuExecutor() {
        int processors = Runtime.getRuntime().availableProcessors();
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(processors);
        executor.setMaxPoolSize(processors * 2);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("${className}CPU-");
        executor.initialize();
        return executor;
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new ${className}AsyncExceptionHandler();
    }

    public static class ${className}AsyncExceptionHandler implements AsyncUncaughtExceptionHandler {

        @Override
        public void handleUncaughtException(Throwable ex, Method method, Object... params) {
            log.error("Async exception in method: {} with params: {}",
                method.getName(), params, ex);

            // Optionally send alert or metric
            // alertService.sendAlert("Async error", ex.getMessage());
        }
    }
}
`,
      language: 'java'
    })
  },

  eventDrivenService: {
    name: 'Event Driven Service',
    description: 'Async event publishing and handling with Spring Events',
    generate: (className, packageName) => ({
      fileName: `${className}EventService.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import java.time.Instant;
import java.util.UUID;

@Service
public class ${className}EventService {

    private static final Logger log = LoggerFactory.getLogger(${className}EventService.class);

    private final ApplicationEventPublisher eventPublisher;

    public ${className}EventService(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    // Publish events
    public void create${className}(${className}CreateRequest request) {
        // Create entity
        ${className} entity = new ${className}();
        entity.setId(UUID.randomUUID().toString());
        entity.setName(request.name());

        // Publish event
        eventPublisher.publishEvent(new ${className}CreatedEvent(this, entity));

        log.info("Published ${className}CreatedEvent for: {}", entity.getId());
    }

    public void update${className}(${className} entity, ${className}UpdateRequest request) {
        String oldName = entity.getName();
        entity.setName(request.name());

        eventPublisher.publishEvent(new ${className}UpdatedEvent(this, entity, oldName));
    }

    public void delete${className}(${className} entity) {
        eventPublisher.publishEvent(new ${className}DeletedEvent(this, entity.getId()));
    }

    // Event Listeners

    @EventListener
    public void handle${className}Created(${className}CreatedEvent event) {
        log.info("Handling ${className}CreatedEvent synchronously: {}", event.getEntity().getId());
        // Synchronous processing
    }

    @Async
    @EventListener
    public void handle${className}CreatedAsync(${className}CreatedEvent event) {
        log.info("Handling ${className}CreatedEvent asynchronously: {}", event.getEntity().getId());
        // Async processing - runs in separate thread
        sendNotification(event.getEntity());
        updateSearchIndex(event.getEntity());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle${className}CreatedAfterCommit(${className}CreatedEvent event) {
        log.info("Handling after transaction commit: {}", event.getEntity().getId());
        // Only runs if transaction commits successfully
        publishToExternalSystem(event.getEntity());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_ROLLBACK)
    public void handle${className}CreatedAfterRollback(${className}CreatedEvent event) {
        log.info("Transaction rolled back for: {}", event.getEntity().getId());
        // Cleanup or logging after rollback
    }

    @EventListener(condition = "#event.entity.status == 'ACTIVE'")
    public void handleActive${className}(${className}CreatedEvent event) {
        log.info("Handling active ${className}: {}", event.getEntity().getId());
        // Only handles events where entity status is ACTIVE
    }

    // Helper methods
    private void sendNotification(${className} entity) {
        log.debug("Sending notification for: {}", entity.getId());
    }

    private void updateSearchIndex(${className} entity) {
        log.debug("Updating search index for: {}", entity.getId());
    }

    private void publishToExternalSystem(${className} entity) {
        log.debug("Publishing to external system: {}", entity.getId());
    }

    // Event classes
    public static class ${className}CreatedEvent extends ApplicationEvent {
        private final ${className} entity;

        public ${className}CreatedEvent(Object source, ${className} entity) {
            super(source);
            this.entity = entity;
        }

        public ${className} getEntity() { return entity; }
    }

    public static class ${className}UpdatedEvent extends ApplicationEvent {
        private final ${className} entity;
        private final String previousName;

        public ${className}UpdatedEvent(Object source, ${className} entity, String previousName) {
            super(source);
            this.entity = entity;
            this.previousName = previousName;
        }

        public ${className} getEntity() { return entity; }
        public String getPreviousName() { return previousName; }
    }

    public static class ${className}DeletedEvent extends ApplicationEvent {
        private final String entityId;
        private final Instant deletedAt;

        public ${className}DeletedEvent(Object source, String entityId) {
            super(source);
            this.entityId = entityId;
            this.deletedAt = Instant.now();
        }

        public String getEntityId() { return entityId; }
        public Instant getDeletedAt() { return deletedAt; }
    }

    // Request DTOs
    public record ${className}CreateRequest(String name, String description) {}
    public record ${className}UpdateRequest(String name, String description) {}
}
`,
      language: 'java'
    })
  },

  parallelStreamService: {
    name: 'Parallel Stream Service',
    description: 'Service using parallel streams for data processing',
    generate: (className, packageName) => ({
      fileName: `${className}ParallelStreamService.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Function;
import java.util.stream.*;

@Service
public class ${className}ParallelStreamService {

    private static final Logger log = LoggerFactory.getLogger(${className}ParallelStreamService.class);

    private final ${className}Repository repository;

    // Custom ForkJoinPool for parallel streams
    private final ForkJoinPool customPool = new ForkJoinPool(
        Runtime.getRuntime().availableProcessors(),
        ForkJoinPool.defaultForkJoinWorkerThreadFactory,
        null,
        true
    );

    public ${className}ParallelStreamService(${className}Repository repository) {
        this.repository = repository;
    }

    // Basic parallel processing
    public List<${className}Result> processAllParallel() {
        return repository.findAll().parallelStream()
            .map(this::processItem)
            .filter(${className}Result::success)
            .toList();
    }

    // Parallel processing with custom thread pool
    public List<${className}Result> processWithCustomPool(List<${className}> items) {
        try {
            return customPool.submit(() ->
                items.parallelStream()
                    .map(this::processItem)
                    .toList()
            ).get();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error in parallel processing", e);
            return Collections.emptyList();
        }
    }

    // Parallel aggregation
    public ${className}Statistics calculateStatistics(List<${className}> items) {
        DoubleSummaryStatistics stats = items.parallelStream()
            .mapToDouble(${className}::getValue)
            .summaryStatistics();

        return new ${className}Statistics(
            stats.getCount(),
            stats.getSum(),
            stats.getAverage(),
            stats.getMin(),
            stats.getMax()
        );
    }

    // Group and process in parallel
    public Map<String, List<${className}Result>> processGrouped(List<${className}> items) {
        return items.parallelStream()
            .collect(Collectors.groupingByConcurrent(
                ${className}::getCategory,
                Collectors.mapping(this::processItem, Collectors.toList())
            ));
    }

    // Parallel reduction
    public Optional<${className}> findBest(List<${className}> items) {
        return items.parallelStream()
            .reduce((a, b) -> a.getScore() > b.getScore() ? a : b);
    }

    // Parallel search with early termination
    public Optional<${className}> findFirst${className}Matching(List<${className}> items,
                                                               String criteria) {
        return items.parallelStream()
            .filter(item -> matches(item, criteria))
            .findAny(); // findAny is more efficient for parallel streams
    }

    // Batch processing with parallel streams
    public List<${className}Result> processBatches(List<${className}> items, int batchSize) {
        return IntStream.range(0, (items.size() + batchSize - 1) / batchSize)
            .parallel()
            .mapToObj(i -> items.subList(
                i * batchSize,
                Math.min((i + 1) * batchSize, items.size())
            ))
            .flatMap(batch -> processBatch(batch).stream())
            .toList();
    }

    // Parallel transformation pipeline
    public List<${className}Output> transformPipeline(List<${className}Input> inputs) {
        return inputs.parallelStream()
            .filter(this::isValid)
            .map(this::normalize)
            .map(this::enrich)
            .map(this::transform)
            .sorted(Comparator.comparing(${className}Output::priority).reversed())
            .toList();
    }

    // Concurrent collection
    public Set<String> extractUnique${className}Names(List<${className}> items) {
        return items.parallelStream()
            .map(${className}::getName)
            .collect(Collectors.toCollection(ConcurrentSkipListSet::new));
    }

    // Parallel flatMap
    public List<${className}Detail> expandAll(List<${className}> items) {
        return items.parallelStream()
            .flatMap(item -> getDetails(item).stream())
            .toList();
    }

    // Performance-aware parallel processing
    public <T, R> List<R> processAdaptively(List<T> items, Function<T, R> processor) {
        // Use parallel only if beneficial
        boolean useParallel = items.size() > 1000 &&
            items.stream().mapToLong(this::estimateProcessingCost).sum() > 10000;

        Stream<T> stream = useParallel ? items.parallelStream() : items.stream();

        return stream.map(processor).toList();
    }

    // Helper methods
    private ${className}Result processItem(${className} item) {
        try {
            // Processing logic
            return ${className}Result.success(item.getId(), item);
        } catch (Exception e) {
            return ${className}Result.failure(item.getId(), e.getMessage());
        }
    }

    private List<${className}Result> processBatch(List<${className}> batch) {
        return batch.stream().map(this::processItem).toList();
    }

    private boolean matches(${className} item, String criteria) {
        return item.getName().contains(criteria);
    }

    private boolean isValid(${className}Input input) { return input != null; }
    private ${className}Input normalize(${className}Input input) { return input; }
    private ${className}Input enrich(${className}Input input) { return input; }
    private ${className}Output transform(${className}Input input) {
        return new ${className}Output(input.name(), 1);
    }
    private List<${className}Detail> getDetails(${className} item) { return List.of(); }
    private long estimateProcessingCost(Object item) { return 10; }

    // DTOs
    public record ${className}Result(String id, ${className} entity, boolean success, String error) {
        public static ${className}Result success(String id, ${className} entity) {
            return new ${className}Result(id, entity, true, null);
        }
        public static ${className}Result failure(String id, String error) {
            return new ${className}Result(id, null, false, error);
        }
    }

    public record ${className}Statistics(
        long count, double sum, double average, double min, double max
    ) {}

    public record ${className}Input(String name) {}
    public record ${className}Output(String name, int priority) {}
    public record ${className}Detail(String id, String info) {}
}
`,
      language: 'java'
    })
  }
};
