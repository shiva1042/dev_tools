// Configuration Templates

export const configTemplates = {
  CORS_CONFIG: {
    name: 'CORS Config',
    description: 'Cross-origin resource sharing',
    generate: (className, packageName) => ({
      name: 'CORS Configuration',
      fileName: 'CorsConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'Cross-Origin Resource Sharing configuration',
      code: `package ${packageName}.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}`,
      explanation: 'CORS configuration using WebMvcConfigurer and CorsConfigurationSource.',
      bestPractices: ['Use environment variables for origins', 'Set appropriate max-age'],
      commonMistakes: ['Using wildcard with credentials', 'Missing OPTIONS method'],
      java21Tips: ['Use List.of() for immutable lists']
    })
  },

  ASYNC_CONFIG: {
    name: 'Async Config',
    description: 'Async executor configuration',
    generate: (className, packageName) => ({
      name: 'Async Configuration',
      fileName: 'AsyncConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'Asynchronous execution with Java 21 virtual threads',
      code: `package ${packageName}.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        // Java 21 Virtual Threads - ideal for I/O operations
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    @Bean(name = "cpuExecutor")
    public Executor cpuExecutor() {
        // Traditional thread pool for CPU-bound operations
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(Runtime.getRuntime().availableProcessors());
        executor.setMaxPoolSize(Runtime.getRuntime().availableProcessors());
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("cpu-");
        executor.initialize();
        return executor;
    }
}

// Usage:
// @Async - uses default taskExecutor (virtual threads)
// @Async("cpuExecutor") - uses CPU-bound executor`,
      explanation: 'Async configuration with virtual threads and traditional thread pool.',
      bestPractices: ['Use virtual threads for I/O', 'Use traditional threads for CPU'],
      commonMistakes: ['Using virtual threads for CPU work', 'No exception handling'],
      java21Tips: ['Virtual threads are ideal for I/O operations']
    })
  },

  CACHE_CONFIG: {
    name: 'Cache Config',
    description: 'Spring cache configuration',
    generate: (className, packageName) => ({
      name: 'Cache Configuration',
      fileName: 'CacheConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'Spring Cache configuration with annotations',
      code: `package ${packageName}.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String USERS_CACHE = "users";
    public static final String ITEMS_CACHE = "items";

    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        cacheManager.setCacheNames(List.of(USERS_CACHE, ITEMS_CACHE));
        return cacheManager;
    }
}

// Usage:
// @Cacheable(value = CacheConfig.USERS_CACHE, key = "#id")
// public User findById(Long id) { ... }
//
// @CachePut(value = CacheConfig.USERS_CACHE, key = "#user.id")
// public User save(User user) { ... }
//
// @CacheEvict(value = CacheConfig.USERS_CACHE, key = "#id")
// public void delete(Long id) { ... }`,
      explanation: 'Cache configuration with ConcurrentMapCacheManager.',
      bestPractices: ['Define cache names as constants', 'Clear cache on updates'],
      commonMistakes: ['Caching mutable objects', 'Not evicting on updates'],
      java21Tips: ['Use records for cached data (immutable)']
    })
  },

  SCHEDULER_CONFIG: {
    name: 'Scheduler',
    description: 'Scheduled task configuration',
    generate: (className, packageName) => ({
      name: 'Scheduler Configuration',
      fileName: 'SchedulerConfig.java',
      packagePath: `${packageName}.config`,
      useCase: 'Scheduled task execution with cron expressions',
      code: `package ${packageName}.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableScheduling
public class SchedulerConfig {}

@Component
class ScheduledTasks {

    @Scheduled(fixedRate = 5, timeUnit = TimeUnit.MINUTES)
    public void runEveryFiveMinutes() {
        System.out.println("Fixed rate task: " + LocalDateTime.now());
    }

    @Scheduled(fixedDelay = 10, timeUnit = TimeUnit.SECONDS)
    public void runWithDelay() {
        System.out.println("Fixed delay task: " + LocalDateTime.now());
    }

    @Scheduled(cron = "0 0 2 * * ?") // Every day at 2 AM
    public void runDailyCleanup() {
        System.out.println("Daily cleanup: " + LocalDateTime.now());
    }

    @Scheduled(cron = "\${scheduled.cleanup.cron:0 0 3 * * ?}")
    public void configurableTask() {
        System.out.println("Configurable task: " + LocalDateTime.now());
    }
}`,
      explanation: 'Scheduler with various @Scheduled patterns.',
      bestPractices: ['Use TimeUnit for readable intervals', 'Make cron configurable'],
      commonMistakes: ['Blocking scheduled tasks', 'Wrong cron syntax'],
      java21Tips: ['Consider virtual threads for I/O in scheduled tasks']
    })
  }
};
