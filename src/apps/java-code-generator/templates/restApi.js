// REST API Templates

export const restApiTemplates = {
  REST_CONTROLLER: {
    name: 'REST Controller',
    description: 'Full CRUD REST controller',
    generate: (className, packageName) => ({
      name: `${className} REST Controller`,
      fileName: `${className}Controller.java`,
      packagePath: `${packageName}.controller`,
      useCase: 'Full CRUD REST controller with pagination and validation',
      code: `package ${packageName}.controller;

import ${packageName}.dto.*;
import ${packageName}.service.${className}Service;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/${className.toLowerCase()}s")
public class ${className}Controller {

    private final ${className}Service service;

    public ${className}Controller(${className}Service service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Page<${className}Response>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<${className}Response> getById(@PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<${className}Response> create(@Valid @RequestBody ${className}Request request) {
        ${className}Response created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<${className}Response> update(
            @PathVariable UUID id,
            @Valid @RequestBody ${className}Request request) {
        return service.update(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (service.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}`,
      explanation: 'RESTful controller with GET, POST, PUT, DELETE and pagination.',
      bestPractices: ['Use API versioning from the start', 'Support pagination for lists'],
      commonMistakes: ['Inconsistent response formats', 'Missing validation'],
      java21Tips: ['Use records for DTOs', 'Pattern matching for response handling']
    })
  },

  PAGINATION: {
    name: 'Pagination',
    description: 'Paginated API responses',
    generate: (className, packageName) => ({
      name: 'Pagination Utilities',
      fileName: 'PageResponse.java',
      packagePath: `${packageName}.dto`,
      useCase: 'Pagination response wrapper with metadata',
      code: `package ${packageName}.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public record PageResponse<T>(
        List<T> content,
        PageInfo pageInfo
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                new PageInfo(
                        page.getNumber(),
                        page.getSize(),
                        page.getTotalElements(),
                        page.getTotalPages(),
                        page.isFirst(),
                        page.isLast()
                )
        );
    }
}

record PageInfo(
        int currentPage,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean isFirst,
        boolean isLast
) {}`,
      explanation: 'Pagination utilities with PageResponse wrapper and metadata.',
      bestPractices: ['Include navigation metadata', 'Set maximum page size limit'],
      commonMistakes: ['No maximum page size limit', 'Missing total count'],
      java21Tips: ['Records for immutable page info']
    })
  },

  GLOBAL_EXCEPTION: {
    name: 'Global Exception Handler',
    description: 'Centralized exception handling',
    generate: (className, packageName) => ({
      name: 'Global Exception Handler',
      fileName: 'GlobalExceptionHandler.java',
      packagePath: `${packageName}.exception`,
      useCase: 'Centralized exception handling with custom exceptions',
      code: `package ${packageName}.exception;

import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            errors.put(fieldName, error.getDefaultMessage());
        });

        return ResponseEntity.badRequest().body(new ErrorResponse(
            LocalDateTime.now(), 400, "Validation Failed", errors.toString(), request.getDescription(false)
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, WebRequest request) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request);
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, WebRequest request) {
        return ResponseEntity.status(status).body(new ErrorResponse(
            LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, request.getDescription(false)
        ));
    }
}

record ErrorResponse(LocalDateTime timestamp, int status, String error, String message, String path) {}

class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
    public ResourceNotFoundException(String resource, Object id) { super(resource + " not found with id: " + id); }
}`,
      explanation: 'Global exception handler with custom exceptions and validation errors.',
      bestPractices: ['Use @RestControllerAdvice', 'Include validation error details'],
      commonMistakes: ['Exposing stack traces', 'Generic error messages'],
      java21Tips: ['Records for error response DTOs']
    })
  },

  RESPONSE_WRAPPER: {
    name: 'Response Wrapper',
    description: 'Standardized API responses',
    generate: (className, packageName) => ({
      name: 'API Response Wrapper',
      fileName: 'ApiResponse.java',
      packagePath: `${packageName}.dto`,
      useCase: 'Standardized API response format',
      code: `package ${packageName}.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        LocalDateTime timestamp
) {
    public ApiResponse {
        timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, data, null);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, null);
    }
}`,
      explanation: 'Unified response wrapper with factory methods.',
      bestPractices: ['Use consistent format', 'Include timestamp'],
      commonMistakes: ['Inconsistent formats', 'Missing error details'],
      java21Tips: ['Records with factory methods']
    })
  },

  FILE_UPLOAD: {
    name: 'File Upload',
    description: 'File upload/download endpoints',
    generate: (className, packageName) => ({
      name: 'File Controller',
      fileName: 'FileController.java',
      packagePath: `${packageName}.controller`,
      useCase: 'File upload, download, and delete endpoints',
      code: `package ${packageName}.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    @Value("\${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> upload(@RequestParam("file") MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(new FileResponse(true, filename, "/api/v1/files/" + filename));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new FileResponse(false, null, null));
        }
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> download(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) return ResponseEntity.notFound().build();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"" + filename + "\\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{filename}")
    public ResponseEntity<Void> delete(@PathVariable String filename) {
        try {
            Files.deleteIfExists(Paths.get(uploadDir).resolve(filename));
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    record FileResponse(boolean success, String filename, String url) {}
}`,
      explanation: 'File handling controller with upload, download, delete.',
      bestPractices: ['Generate unique filenames', 'Validate file types'],
      commonMistakes: ['Using original filename directly', 'No file size limits'],
      java21Tips: ['Use Path API over File']
    })
  }
};
