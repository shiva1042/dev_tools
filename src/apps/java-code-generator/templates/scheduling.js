// Scheduling Templates
// Scheduled tasks, cron jobs, batch processing patterns

export const schedulingTemplates = {
  scheduledTask: {
    name: 'Scheduled Task',
    description: 'Basic scheduled task with @Scheduled annotation',
    generate: (className, packageName) => ({
      fileName: `${className}ScheduledTask.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ${className}ScheduledTask {

    private static final Logger log = LoggerFactory.getLogger(${className}ScheduledTask.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AtomicInteger executionCount = new AtomicInteger(0);
    private final ${className}Service service;

    public ${className}ScheduledTask(${className}Service service) {
        this.service = service;
    }

    // Fixed rate - runs every 5 seconds regardless of previous execution
    @Scheduled(fixedRate = 5000)
    public void runAtFixedRate() {
        int count = executionCount.incrementAndGet();
        log.info("[{}] Fixed rate task executed at: {}",
            count, LocalDateTime.now().format(formatter));

        try {
            service.processRecent${className}s();
        } catch (Exception e) {
            log.error("Error in fixed rate task", e);
        }
    }

    // Fixed delay - waits 10 seconds after previous execution completes
    @Scheduled(fixedDelay = 10000)
    public void runWithFixedDelay() {
        log.info("Fixed delay task started at: {}", LocalDateTime.now().format(formatter));

        try {
            service.cleanupStale${className}s();
        } catch (Exception e) {
            log.error("Error in fixed delay task", e);
        }
    }

    // Initial delay - waits 30 seconds before first execution
    @Scheduled(fixedRate = 60000, initialDelay = 30000)
    public void runWithInitialDelay() {
        log.info("Task with initial delay executed");
        service.refreshCache();
    }

    // Cron expression - runs at 2 AM every day
    @Scheduled(cron = "0 0 2 * * ?")
    public void runDailyCleanup() {
        log.info("Daily cleanup started at: {}", LocalDateTime.now().format(formatter));

        try {
            int deleted = service.deleteOld${className}s();
            log.info("Daily cleanup completed. Deleted {} records", deleted);
        } catch (Exception e) {
            log.error("Error in daily cleanup", e);
        }
    }

    // Cron expression - runs every Monday at 9 AM
    @Scheduled(cron = "0 0 9 * * MON")
    public void runWeeklyReport() {
        log.info("Weekly report generation started");
        service.generateWeeklyReport();
    }

    // Cron with timezone
    @Scheduled(cron = "0 0 12 * * ?", zone = "America/New_York")
    public void runAtNoonET() {
        log.info("Noon ET task executed");
    }

    // Using expression from properties
    @Scheduled(cron = "\${${className.toLowerCase()}.cleanup.cron:0 0 3 * * ?}")
    public void runConfigurableTask() {
        log.info("Configurable scheduled task executed");
    }

    public int getExecutionCount() {
        return executionCount.get();
    }
}
`,
      language: 'java'
    })
  },

  asyncScheduler: {
    name: 'Async Scheduler',
    description: 'Async scheduled tasks with ThreadPoolTaskScheduler',
    generate: (className, packageName) => ({
      fileName: `${className}AsyncScheduler.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ScheduledFuture;

@Component
public class ${className}AsyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(${className}AsyncScheduler.class);

    private final ThreadPoolTaskScheduler taskScheduler;
    private final ${className}Service service;
    private ScheduledFuture<?> dynamicTask;

    public ${className}AsyncScheduler(${className}Service service) {
        this.service = service;
        this.taskScheduler = new ThreadPoolTaskScheduler();
        this.taskScheduler.setPoolSize(5);
        this.taskScheduler.setThreadNamePrefix("${className}Scheduler-");
        this.taskScheduler.setWaitForTasksToCompleteOnShutdown(true);
        this.taskScheduler.setAwaitTerminationSeconds(30);
        this.taskScheduler.initialize();
    }

    @PostConstruct
    public void init() {
        log.info("${className}AsyncScheduler initialized");
        scheduleDynamicTask(Duration.ofMinutes(5));
    }

    @PreDestroy
    public void shutdown() {
        if (dynamicTask != null && !dynamicTask.isCancelled()) {
            dynamicTask.cancel(false);
        }
        taskScheduler.shutdown();
        log.info("${className}AsyncScheduler shut down");
    }

    // Async scheduled task - runs in separate thread pool
    @Async
    @Scheduled(fixedRate = 60000)
    public void asyncScheduledTask() {
        log.info("Async scheduled task running on thread: {}",
            Thread.currentThread().getName());

        try {
            service.processAsync${className}s();
        } catch (Exception e) {
            log.error("Error in async scheduled task", e);
        }
    }

    // Schedule task dynamically
    public void scheduleDynamicTask(Duration interval) {
        if (dynamicTask != null && !dynamicTask.isCancelled()) {
            dynamicTask.cancel(false);
        }

        dynamicTask = taskScheduler.scheduleAtFixedRate(
            () -> {
                log.info("Dynamic task executed");
                service.executeDynamicTask();
            },
            interval
        );

        log.info("Dynamic task scheduled with interval: {}", interval);
    }

    // Schedule one-time task
    public ScheduledFuture<?> scheduleOnce(Runnable task, Instant startTime) {
        return taskScheduler.schedule(task, startTime);
    }

    // Schedule with delay
    public ScheduledFuture<?> scheduleWithDelay(Runnable task, Duration delay) {
        return taskScheduler.schedule(task, Instant.now().plus(delay));
    }

    // Async task returning result
    @Async
    public CompletableFuture<${className}Report> generateReportAsync() {
        log.info("Starting async report generation");

        try {
            ${className}Report report = service.generateReport();
            log.info("Report generation completed");
            return CompletableFuture.completedFuture(report);
        } catch (Exception e) {
            log.error("Error generating report", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    // Cancel dynamic task
    public boolean cancelDynamicTask() {
        if (dynamicTask != null && !dynamicTask.isCancelled()) {
            boolean cancelled = dynamicTask.cancel(false);
            log.info("Dynamic task cancelled: {}", cancelled);
            return cancelled;
        }
        return false;
    }

    // Check if dynamic task is running
    public boolean isDynamicTaskActive() {
        return dynamicTask != null && !dynamicTask.isCancelled() && !dynamicTask.isDone();
    }
}
`,
      language: 'java'
    })
  },

  schedulerConfig: {
    name: 'Scheduler Configuration',
    description: 'Configuration for scheduled tasks with thread pool',
    generate: (className, packageName) => ({
      fileName: `${className}SchedulerConfig.java`,
      content: `package ${packageName};

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import java.util.concurrent.Executor;

@Configuration
@EnableScheduling
@EnableAsync
public class ${className}SchedulerConfig implements SchedulingConfigurer {

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.setTaskScheduler(taskScheduler());
    }

    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("${className}TaskScheduler-");
        scheduler.setErrorHandler(t -> {
            // Custom error handling
            System.err.println("Error in scheduled task: " + t.getMessage());
        });
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(60);
        scheduler.initialize();
        return scheduler;
    }

    @Bean(name = "asyncExecutor")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("${className}Async-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    @Bean(name = "batchExecutor")
    public Executor batchExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("${className}Batch-");
        executor.initialize();
        return executor;
    }
}
`,
      language: 'java'
    })
  },

  batchProcessor: {
    name: 'Batch Processor',
    description: 'Spring Batch job with reader, processor, writer',
    generate: (className, packageName) => ({
      fileName: `${className}BatchProcessor.java`,
      content: `package ${packageName};

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.database.JdbcCursorItemReader;
import org.springframework.batch.item.database.builder.JdbcCursorItemReaderBuilder;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.transaction.PlatformTransactionManager;
import javax.sql.DataSource;

@Configuration
public class ${className}BatchProcessor {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final DataSource dataSource;

    public ${className}BatchProcessor(JobRepository jobRepository,
                                      PlatformTransactionManager transactionManager,
                                      DataSource dataSource) {
        this.jobRepository = jobRepository;
        this.transactionManager = transactionManager;
        this.dataSource = dataSource;
    }

    @Bean
    public Job ${className.toLowerCase()}ProcessingJob() {
        return new JobBuilder("${className.toLowerCase()}ProcessingJob", jobRepository)
            .incrementer(new RunIdIncrementer())
            .start(${className.toLowerCase()}ProcessingStep())
            .build();
    }

    @Bean
    public Step ${className.toLowerCase()}ProcessingStep() {
        return new StepBuilder("${className.toLowerCase()}ProcessingStep", jobRepository)
            .<${className}Input, ${className}Output>chunk(100, transactionManager)
            .reader(${className.toLowerCase()}Reader())
            .processor(${className.toLowerCase()}Processor())
            .writer(${className.toLowerCase()}Writer())
            .faultTolerant()
            .retryLimit(3)
            .retry(Exception.class)
            .skipLimit(10)
            .skip(Exception.class)
            .build();
    }

    @Bean
    public ItemReader<${className}Input> ${className.toLowerCase()}Reader() {
        return new JdbcCursorItemReaderBuilder<${className}Input>()
            .name("${className.toLowerCase()}Reader")
            .dataSource(dataSource)
            .sql("SELECT id, name, status, data FROM ${className.toLowerCase()}s WHERE processed = false")
            .rowMapper(new BeanPropertyRowMapper<>(${className}Input.class))
            .build();
    }

    @Bean
    public ItemProcessor<${className}Input, ${className}Output> ${className.toLowerCase()}Processor() {
        return input -> {
            // Transform input to output
            ${className}Output output = new ${className}Output();
            output.setId(input.getId());
            output.setName(input.getName().toUpperCase());
            output.setProcessedData(process(input.getData()));
            output.setStatus("PROCESSED");
            return output;
        };
    }

    @Bean
    public ItemWriter<${className}Output> ${className.toLowerCase()}Writer() {
        return new JdbcBatchItemWriterBuilder<${className}Output>()
            .dataSource(dataSource)
            .sql("UPDATE ${className.toLowerCase()}s SET name = :name, status = :status, " +
                 "processed_data = :processedData, processed = true WHERE id = :id")
            .beanMapped()
            .build();
    }

    private String process(String data) {
        // Custom processing logic
        return data != null ? data.trim() : "";
    }

    // Input/Output DTOs
    public static class ${className}Input {
        private Long id;
        private String name;
        private String status;
        private String data;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getData() { return data; }
        public void setData(String data) { this.data = data; }
    }

    public static class ${className}Output {
        private Long id;
        private String name;
        private String status;
        private String processedData;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getProcessedData() { return processedData; }
        public void setProcessedData(String processedData) { this.processedData = processedData; }
    }
}
`,
      language: 'java'
    })
  },

  jobListener: {
    name: 'Job Listener',
    description: 'Spring Batch job execution listener',
    generate: (className, packageName) => ({
      fileName: `${className}JobListener.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.core.ExitStatus;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class ${className}JobListener implements JobExecutionListener, StepExecutionListener {

    private static final Logger log = LoggerFactory.getLogger(${className}JobListener.class);

    private final ${className}NotificationService notificationService;

    public ${className}JobListener(${className}NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info("Job {} started at {}",
            jobExecution.getJobInstance().getJobName(),
            LocalDateTime.now());

        jobExecution.getExecutionContext().put("startTime", System.currentTimeMillis());
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        long startTime = jobExecution.getExecutionContext().getLong("startTime", 0);
        long duration = System.currentTimeMillis() - startTime;

        String jobName = jobExecution.getJobInstance().getJobName();
        BatchStatus status = jobExecution.getStatus();

        log.info("Job {} completed with status {} in {} ms",
            jobName, status, duration);

        // Log step summaries
        for (StepExecution stepExecution : jobExecution.getStepExecutions()) {
            log.info("Step: {} | Read: {} | Written: {} | Skipped: {} | Status: {}",
                stepExecution.getStepName(),
                stepExecution.getReadCount(),
                stepExecution.getWriteCount(),
                stepExecution.getSkipCount(),
                stepExecution.getStatus());
        }

        // Send notification based on status
        if (status == BatchStatus.COMPLETED) {
            notificationService.sendSuccess(jobName, duration);
        } else if (status == BatchStatus.FAILED) {
            String errorMessage = jobExecution.getAllFailureExceptions().stream()
                .map(Throwable::getMessage)
                .reduce((a, b) -> a + "; " + b)
                .orElse("Unknown error");
            notificationService.sendFailure(jobName, errorMessage);
        }
    }

    @Override
    public void beforeStep(StepExecution stepExecution) {
        log.debug("Step {} starting", stepExecution.getStepName());
    }

    @Override
    public ExitStatus afterStep(StepExecution stepExecution) {
        log.debug("Step {} finished with status {}",
            stepExecution.getStepName(),
            stepExecution.getStatus());

        // Custom exit status logic
        if (stepExecution.getSkipCount() > 0) {
            return new ExitStatus("COMPLETED_WITH_SKIPS");
        }

        return stepExecution.getExitStatus();
    }
}
`,
      language: 'java'
    })
  },

  quartzJob: {
    name: 'Quartz Job',
    description: 'Quartz scheduler job with trigger configuration',
    generate: (className, packageName) => ({
      fileName: `${className}QuartzJob.java`,
      content: `package ${packageName};

import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@DisallowConcurrentExecution
@PersistJobDataAfterExecution
public class ${className}QuartzJob extends QuartzJobBean {

    private static final Logger log = LoggerFactory.getLogger(${className}QuartzJob.class);

    private ${className}Service service;

    // Setter injection for Quartz
    public void setService(${className}Service service) {
        this.service = service;
    }

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        JobDataMap dataMap = context.getJobDetail().getJobDataMap();

        String jobId = dataMap.getString("jobId");
        int retryCount = dataMap.getInt("retryCount");

        log.info("Executing ${className} Quartz job: {} (retry: {})", jobId, retryCount);

        try {
            // Execute job logic
            service.executeScheduledTask();

            // Update job data
            dataMap.put("lastExecutionTime", LocalDateTime.now().toString());
            dataMap.put("executionCount", dataMap.getInt("executionCount") + 1);

            log.info("${className} Quartz job completed successfully");

        } catch (Exception e) {
            log.error("Error executing ${className} Quartz job", e);

            // Retry logic
            if (retryCount < 3) {
                dataMap.put("retryCount", retryCount + 1);
                throw new JobExecutionException("Job failed, will retry", e, true);
            } else {
                throw new JobExecutionException("Job failed after retries", e, false);
            }
        }
    }

    @Configuration
    public static class ${className}QuartzConfig {

        @Bean
        public JobDetail ${className.toLowerCase()}JobDetail() {
            return JobBuilder.newJob(${className}QuartzJob.class)
                .withIdentity("${className.toLowerCase()}Job", "${className.toLowerCase()}Group")
                .withDescription("${className} processing job")
                .usingJobData("jobId", "${className.toLowerCase()}-job-1")
                .usingJobData("retryCount", 0)
                .usingJobData("executionCount", 0)
                .storeDurably()
                .build();
        }

        @Bean
        public Trigger ${className.toLowerCase()}JobTrigger(JobDetail ${className.toLowerCase()}JobDetail) {
            return TriggerBuilder.newTrigger()
                .forJob(${className.toLowerCase()}JobDetail)
                .withIdentity("${className.toLowerCase()}Trigger", "${className.toLowerCase()}Group")
                .withDescription("${className} job trigger")
                .withSchedule(CronScheduleBuilder
                    .cronSchedule("0 0 * * * ?") // Every hour
                    .withMisfireHandlingInstructionFireAndProceed())
                .build();
        }

        // Simple trigger alternative
        @Bean
        public Trigger ${className.toLowerCase()}SimpleJobTrigger(JobDetail ${className.toLowerCase()}JobDetail) {
            return TriggerBuilder.newTrigger()
                .forJob(${className.toLowerCase()}JobDetail)
                .withIdentity("${className.toLowerCase()}SimpleTrigger", "${className.toLowerCase()}Group")
                .withSchedule(SimpleScheduleBuilder
                    .simpleSchedule()
                    .withIntervalInMinutes(30)
                    .repeatForever()
                    .withMisfireHandlingInstructionNextWithRemainingCount())
                .build();
        }
    }
}
`,
      language: 'java'
    })
  }
};
