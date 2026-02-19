// Spring Boot Templates

export const springBootTemplates = {
  MAIN_APPLICATION: {
    name: 'Main Application',
    description: 'Spring Boot main class',
    generate: (className, packageName) => ({
      name: `${className} Application`,
      fileName: `${className}Application.java`,
      packagePath: packageName,
      useCase: 'Spring Boot main application class',
      code: `package ${packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Spring Boot Application Entry Point
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class ${className}Application {

    public static void main(String[] args) {
        SpringApplication.run(${className}Application.class, args);
    }

    // Optional: Add CommandLineRunner for startup tasks
    // @Bean
    // CommandLineRunner init() {
    //     return args -> System.out.println("Application started!");
    // }
}`,
      explanation: 'Spring Boot entry point with async and scheduling support.',
      bestPractices: ['Keep main class minimal', 'Use CommandLineRunner for initialization'],
      commonMistakes: ['Too much logic in main class', 'Wrong package structure'],
      java21Tips: ['Use virtual threads with @EnableAsync']
    })
  },

  APPLICATION_YML: {
    name: 'Application YAML',
    description: 'Application configuration',
    generate: (className, packageName) => ({
      name: 'Application YAML',
      fileName: 'application.yml',
      packagePath: 'resources',
      useCase: 'Spring Boot application configuration',
      code: `# Spring Boot Application Configuration
spring:
  application:
    name: ${className.toLowerCase()}

  profiles:
    active: \${SPRING_PROFILES_ACTIVE:dev}

  jackson:
    date-format: yyyy-MM-dd'T'HH:mm:ss
    serialization:
      write-dates-as-timestamps: false

  # Virtual Threads (Java 21)
  threads:
    virtual:
      enabled: true

server:
  port: \${SERVER_PORT:8080}

logging:
  level:
    root: INFO
    ${packageName}: DEBUG

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics

---
# Development Profile
spring:
  config:
    activate:
      on-profile: dev

logging:
  level:
    ${packageName}: DEBUG

---
# Production Profile
spring:
  config:
    activate:
      on-profile: prod

logging:
  level:
    root: WARN`,
      explanation: 'Comprehensive application.yml with profiles and virtual threads.',
      bestPractices: ['Use environment variables', 'Configure profiles'],
      commonMistakes: ['Hardcoding sensitive values', 'Not using profiles'],
      java21Tips: ['Enable virtual threads with spring.threads.virtual.enabled']
    })
  },

  POM_XML: {
    name: 'Maven POM',
    description: 'Maven project configuration',
    generate: (className, packageName) => ({
      name: 'Maven POM',
      fileName: 'pom.xml',
      packagePath: '',
      useCase: 'Maven project configuration for Spring Boot 3.5.4',
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.4</version>
    </parent>

    <groupId>${packageName}</groupId>
    <artifactId>${className.toLowerCase()}</artifactId>
    <version>1.0.0</version>
    <name>${className}</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`,
      explanation: 'Maven POM with Spring Boot parent and common dependencies.',
      bestPractices: ['Use Spring Boot parent', 'Include starter-test'],
      commonMistakes: ['Wrong Java version', 'Missing validation starter'],
      java21Tips: ['Use Java 21 for virtual threads and records']
    })
  }
};
