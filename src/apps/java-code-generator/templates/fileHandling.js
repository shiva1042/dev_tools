// File Handling Templates
// File upload/download, S3 integration, streaming patterns

export const fileHandlingTemplates = {
  fileUploadController: {
    name: 'File Upload Controller',
    description: 'REST controller for file upload with validation',
    generate: (className, packageName) => ({
      fileName: `${className}FileUploadController.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/${className.toLowerCase()}/files")
public class ${className}FileUploadController {

    private static final Logger log = LoggerFactory.getLogger(${className}FileUploadController.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_TYPES = List.of(
        "image/jpeg", "image/png", "image/gif",
        "application/pdf", "text/plain", "text/csv"
    );

    private final ${className}FileService fileService;

    public ${className}FileUploadController(${className}FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<${className}FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {

        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ${className}FileResponse(null, "File is empty", false));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest()
                .body(new ${className}FileResponse(null, "File size exceeds limit", false));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest()
                .body(new ${className}FileResponse(null, "File type not allowed", false));
        }

        try {
            ${className}FileMetadata metadata = fileService.storeFile(file, description);
            log.info("File uploaded: {}", metadata.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ${className}FileResponse(metadata, "File uploaded successfully", true));

        } catch (IOException e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ${className}FileResponse(null, "Upload failed: " + e.getMessage(), false));
        }
    }

    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<${className}FileResponse>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files) {

        if (files.length == 0) {
            return ResponseEntity.badRequest().build();
        }

        List<${className}FileResponse> responses = fileService.storeFiles(files);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @PostMapping(value = "/upload-chunked")
    public ResponseEntity<${className}ChunkResponse> uploadChunk(
            @RequestParam("file") MultipartFile chunk,
            @RequestParam("uploadId") String uploadId,
            @RequestParam("chunkNumber") int chunkNumber,
            @RequestParam("totalChunks") int totalChunks) {

        try {
            ${className}ChunkResponse response = fileService.processChunk(
                uploadId, chunk, chunkNumber, totalChunks);

            if (response.isComplete()) {
                log.info("Chunked upload completed: {}", uploadId);
            }

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error processing chunk", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ${className}ChunkResponse(uploadId, chunkNumber, false, e.getMessage()));
        }
    }

    // Record DTOs
    public record ${className}FileResponse(
        ${className}FileMetadata metadata,
        String message,
        boolean success
    ) {}

    public record ${className}ChunkResponse(
        String uploadId,
        int chunkNumber,
        boolean complete,
        String message
    ) {}
}
`,
      language: 'java'
    })
  },

  fileDownloadController: {
    name: 'File Download Controller',
    description: 'REST controller for file download with streaming',
    generate: (className, packageName) => ({
      fileName: `${className}FileDownloadController.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import jakarta.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/${className.toLowerCase()}/files")
public class ${className}FileDownloadController {

    private static final Logger log = LoggerFactory.getLogger(${className}FileDownloadController.class);
    private static final int BUFFER_SIZE = 8192;

    private final ${className}FileService fileService;

    public ${className}FileDownloadController(${className}FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id) {
        ${className}FileMetadata metadata = fileService.getMetadata(id);
        if (metadata == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            InputStream inputStream = fileService.getFileInputStream(id);
            InputStreamResource resource = new InputStreamResource(inputStream);

            String encodedFilename = URLEncoder.encode(metadata.getOriginalName(), StandardCharsets.UTF_8)
                .replace("+", "%20");

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename*=UTF-8''" + encodedFilename)
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .contentLength(metadata.getSize())
                .body(resource);

        } catch (FileNotFoundException e) {
            log.error("File not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            log.error("Error downloading file: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/stream/{id}")
    public ResponseEntity<StreamingResponseBody> streamFile(@PathVariable String id) {
        ${className}FileMetadata metadata = fileService.getMetadata(id);
        if (metadata == null) {
            return ResponseEntity.notFound().build();
        }

        StreamingResponseBody stream = outputStream -> {
            try (InputStream inputStream = fileService.getFileInputStream(id)) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                    outputStream.flush();
                }
            }
        };

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + metadata.getOriginalName() + "\"")
            .contentType(MediaType.parseMediaType(metadata.getContentType()))
            .body(stream);
    }

    @GetMapping("/download-zip")
    public void downloadAsZip(
            @RequestParam("ids") String[] ids,
            HttpServletResponse response) throws IOException {

        response.setContentType("application/zip");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"${className.toLowerCase()}-files.zip\"");

        try (ZipOutputStream zipOut = new ZipOutputStream(response.getOutputStream())) {
            for (String id : ids) {
                ${className}FileMetadata metadata = fileService.getMetadata(id);
                if (metadata != null) {
                    try (InputStream inputStream = fileService.getFileInputStream(id)) {
                        ZipEntry zipEntry = new ZipEntry(metadata.getOriginalName());
                        zipOut.putNextEntry(zipEntry);

                        byte[] buffer = new byte[BUFFER_SIZE];
                        int bytesRead;
                        while ((bytesRead = inputStream.read(buffer)) != -1) {
                            zipOut.write(buffer, 0, bytesRead);
                        }

                        zipOut.closeEntry();
                    } catch (Exception e) {
                        log.error("Error adding file to zip: {}", id, e);
                    }
                }
            }
        }

        log.info("Downloaded {} files as zip", ids.length);
    }

    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> previewFile(@PathVariable String id) {
        ${className}FileMetadata metadata = fileService.getMetadata(id);
        if (metadata == null) {
            return ResponseEntity.notFound().build();
        }

        // Only allow preview for certain types
        if (!isPreviewable(metadata.getContentType())) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }

        try {
            InputStream inputStream = fileService.getFileInputStream(id);
            InputStreamResource resource = new InputStreamResource(inputStream);

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .contentLength(metadata.getSize())
                .body(resource);

        } catch (IOException e) {
            log.error("Error previewing file: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isPreviewable(String contentType) {
        return contentType != null && (
            contentType.startsWith("image/") ||
            contentType.equals("application/pdf") ||
            contentType.startsWith("text/")
        );
    }
}
`,
      language: 'java'
    })
  },

  fileService: {
    name: 'File Service',
    description: 'Service for file storage and retrieval',
    generate: (className, packageName) => ({
      fileName: `${className}FileService.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ${className}FileService {

    private static final Logger log = LoggerFactory.getLogger(${className}FileService.class);

    @Value("\${${className.toLowerCase()}.file.upload-dir:./uploads}")
    private String uploadDir;

    private final ${className}FileRepository repository;
    private final Map<String, List<byte[]>> chunkStorage = new ConcurrentHashMap<>();

    public ${className}FileService(${className}FileRepository repository) {
        this.repository = repository;
    }

    public ${className}FileMetadata storeFile(MultipartFile file, String description) throws IOException {
        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileId = UUID.randomUUID().toString();
        String extension = getFileExtension(originalFilename);
        String storedFilename = fileId + (extension.isEmpty() ? "" : "." + extension);

        // Calculate checksum
        String checksum = calculateChecksum(file.getInputStream());

        // Check for duplicate
        Optional<${className}FileMetadata> existing = repository.findByChecksum(checksum);
        if (existing.isPresent()) {
            log.info("Duplicate file detected: {}", existing.get().getId());
            return existing.get();
        }

        // Store file
        Path filePath = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save metadata
        ${className}FileMetadata metadata = new ${className}FileMetadata();
        metadata.setId(fileId);
        metadata.setOriginalName(originalFilename);
        metadata.setStoredName(storedFilename);
        metadata.setContentType(file.getContentType());
        metadata.setSize(file.getSize());
        metadata.setChecksum(checksum);
        metadata.setDescription(description);
        metadata.setUploadedAt(LocalDateTime.now());
        metadata.setStoragePath(filePath.toString());

        return repository.save(metadata);
    }

    public List<${className}FileResponse> storeFiles(MultipartFile[] files) {
        List<${className}FileResponse> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                ${className}FileMetadata metadata = storeFile(file, null);
                responses.add(new ${className}FileResponse(metadata, "Success", true));
            } catch (IOException e) {
                responses.add(new ${className}FileResponse(null, "Failed: " + e.getMessage(), false));
            }
        }

        return responses;
    }

    public ${className}ChunkResponse processChunk(String uploadId, MultipartFile chunk,
                                                  int chunkNumber, int totalChunks) throws IOException {
        chunkStorage.computeIfAbsent(uploadId, k -> new ArrayList<>(Collections.nCopies(totalChunks, null)));

        List<byte[]> chunks = chunkStorage.get(uploadId);
        chunks.set(chunkNumber, chunk.getBytes());

        // Check if all chunks received
        boolean allReceived = chunks.stream().allMatch(Objects::nonNull);

        if (allReceived) {
            // Merge chunks and store
            ByteArrayOutputStream merged = new ByteArrayOutputStream();
            for (byte[] chunkData : chunks) {
                merged.write(chunkData);
            }

            // Clean up
            chunkStorage.remove(uploadId);

            // Store merged file
            Path uploadPath = Paths.get(uploadDir);
            Path filePath = uploadPath.resolve(uploadId);
            Files.write(filePath, merged.toByteArray());

            return new ${className}ChunkResponse(uploadId, chunkNumber, true, "Upload complete");
        }

        long received = chunks.stream().filter(Objects::nonNull).count();
        return new ${className}ChunkResponse(uploadId, chunkNumber, false,
            String.format("Chunk %d/%d received (%d/%d total)",
                chunkNumber + 1, totalChunks, received, totalChunks));
    }

    public ${className}FileMetadata getMetadata(String id) {
        return repository.findById(id).orElse(null);
    }

    public InputStream getFileInputStream(String id) throws IOException {
        ${className}FileMetadata metadata = getMetadata(id);
        if (metadata == null) {
            throw new FileNotFoundException("File not found: " + id);
        }
        return new FileInputStream(metadata.getStoragePath());
    }

    public void deleteFile(String id) throws IOException {
        ${className}FileMetadata metadata = getMetadata(id);
        if (metadata != null) {
            Files.deleteIfExists(Paths.get(metadata.getStoragePath()));
            repository.deleteById(id);
            log.info("File deleted: {}", id);
        }
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }

    private String calculateChecksum(InputStream inputStream) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            byte[] hashBytes = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IOException("Failed to calculate checksum", e);
        }
    }

    public record ${className}FileResponse(
        ${className}FileMetadata metadata,
        String message,
        boolean success
    ) {}

    public record ${className}ChunkResponse(
        String uploadId,
        int chunkNumber,
        boolean complete,
        String message
    ) {}
}
`,
      language: 'java'
    })
  },

  s3Service: {
    name: 'S3 Service',
    description: 'AWS S3 file storage service',
    generate: (className, packageName) => ({
      fileName: `${className}S3Service.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Duration;
import java.util.*;

@Service
public class ${className}S3Service {

    private static final Logger log = LoggerFactory.getLogger(${className}S3Service.class);

    @Value("\${aws.s3.bucket}")
    private String bucketName;

    @Value("\${aws.s3.presigned-url-duration:3600}")
    private long presignedUrlDuration;

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    public ${className}S3Service(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    public ${className}S3UploadResult uploadFile(MultipartFile file, String folder) throws IOException {
        String key = generateKey(folder, file.getOriginalFilename());

        Map<String, String> metadata = new HashMap<>();
        metadata.put("original-filename", file.getOriginalFilename());
        metadata.put("content-type", file.getContentType());
        metadata.put("uploaded-at", java.time.Instant.now().toString());

        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(file.getContentType())
            .contentLength(file.getSize())
            .metadata(metadata)
            .build();

        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        log.info("File uploaded to S3: {}", key);

        return new ${className}S3UploadResult(
            key,
            bucketName,
            file.getSize(),
            getPublicUrl(key)
        );
    }

    public ${className}S3UploadResult uploadWithPresignedUrl(String filename, String contentType, String folder) {
        String key = generateKey(folder, filename);

        PutObjectRequest objectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(15))
            .putObjectRequest(objectRequest)
            .build();

        URL presignedUrl = s3Presigner.presignPutObject(presignRequest).url();

        return new ${className}S3UploadResult(key, bucketName, 0, presignedUrl.toString());
    }

    public InputStream downloadFile(String key) {
        GetObjectRequest request = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();

        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(request);
        log.info("File downloaded from S3: {}", key);
        return response;
    }

    public String getPresignedDownloadUrl(String key) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofSeconds(presignedUrlDuration))
            .getObjectRequest(objectRequest)
            .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    public void deleteFile(String key) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();

        s3Client.deleteObject(request);
        log.info("File deleted from S3: {}", key);
    }

    public void deleteFiles(List<String> keys) {
        List<ObjectIdentifier> objects = keys.stream()
            .map(key -> ObjectIdentifier.builder().key(key).build())
            .toList();

        DeleteObjectsRequest request = DeleteObjectsRequest.builder()
            .bucket(bucketName)
            .delete(Delete.builder().objects(objects).build())
            .build();

        s3Client.deleteObjects(request);
        log.info("Deleted {} files from S3", keys.size());
    }

    public List<${className}S3Object> listFiles(String prefix) {
        ListObjectsV2Request request = ListObjectsV2Request.builder()
            .bucket(bucketName)
            .prefix(prefix)
            .maxKeys(1000)
            .build();

        ListObjectsV2Response response = s3Client.listObjectsV2(request);

        return response.contents().stream()
            .map(obj -> new ${className}S3Object(
                obj.key(),
                obj.size(),
                obj.lastModified().toString(),
                obj.storageClass().toString()
            ))
            .toList();
    }

    public boolean fileExists(String key) {
        try {
            HeadObjectRequest request = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
            s3Client.headObject(request);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    public void copyFile(String sourceKey, String destinationKey) {
        CopyObjectRequest request = CopyObjectRequest.builder()
            .sourceBucket(bucketName)
            .sourceKey(sourceKey)
            .destinationBucket(bucketName)
            .destinationKey(destinationKey)
            .build();

        s3Client.copyObject(request);
        log.info("File copied: {} -> {}", sourceKey, destinationKey);
    }

    private String generateKey(String folder, String filename) {
        String uuid = UUID.randomUUID().toString();
        String sanitizedFilename = filename.replaceAll("[^a-zA-Z0-9.-]", "_");
        return String.format("%s/%s_%s", folder, uuid, sanitizedFilename);
    }

    private String getPublicUrl(String key) {
        return String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
    }

    public record ${className}S3UploadResult(
        String key,
        String bucket,
        long size,
        String url
    ) {}

    public record ${className}S3Object(
        String key,
        long size,
        String lastModified,
        String storageClass
    ) {}
}
`,
      language: 'java'
    })
  },

  fileMetadataEntity: {
    name: 'File Metadata Entity',
    description: 'JPA entity for file metadata storage',
    generate: (className, packageName) => ({
      fileName: `${className}FileMetadata.java`,
      content: `package ${packageName};

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "${className.toLowerCase()}_file_metadata",
    indexes = {
        @Index(name = "idx_${className.toLowerCase()}_file_checksum", columnList = "checksum"),
        @Index(name = "idx_${className.toLowerCase()}_file_uploaded_at", columnList = "uploaded_at")
    })
public class ${className}FileMetadata {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    @Column(name = "stored_name", nullable = false, length = 255)
    private String storedName;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(nullable = false)
    private Long size;

    @Column(length = 64, unique = true)
    private String checksum;

    @Column(length = 500)
    private String description;

    @Column(name = "storage_path", length = 500)
    private String storagePath;

    @Column(name = "s3_key", length = 500)
    private String s3Key;

    @Column(name = "s3_bucket", length = 100)
    private String s3Bucket;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", length = 20)
    private StorageType storageType = StorageType.LOCAL;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;

    @Column(name = "deleted")
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Version
    private Long version;

    public enum StorageType {
        LOCAL, S3, AZURE_BLOB, GCS
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }

    public String getStoredName() { return storedName; }
    public void setStoredName(String storedName) { this.storedName = storedName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }

    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public String getS3Key() { return s3Key; }
    public void setS3Key(String s3Key) { this.s3Key = s3Key; }

    public String getS3Bucket() { return s3Bucket; }
    public void setS3Bucket(String s3Bucket) { this.s3Bucket = s3Bucket; }

    public StorageType getStorageType() { return storageType; }
    public void setStorageType(StorageType storageType) { this.storageType = storageType; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public Long getVersion() { return version; }

    // Helper methods
    public String getFormattedSize() {
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return String.format("%.1f KB", size / 1024.0);
        if (size < 1024 * 1024 * 1024) return String.format("%.1f MB", size / (1024.0 * 1024));
        return String.format("%.1f GB", size / (1024.0 * 1024 * 1024));
    }

    public boolean isImage() {
        return contentType != null && contentType.startsWith("image/");
    }

    public boolean isPdf() {
        return "application/pdf".equals(contentType);
    }
}
`,
      language: 'java'
    })
  },

  csvExporter: {
    name: 'CSV Exporter',
    description: 'Service for exporting data to CSV files',
    generate: (className, packageName) => ({
      fileName: `${className}CsvExporter.java`,
      content: `package ${packageName};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import java.io.*;
import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Stream;

@Service
public class ${className}CsvExporter {

    private static final Logger log = LoggerFactory.getLogger(${className}CsvExporter.class);
    private static final String DELIMITER = ",";
    private static final String LINE_SEPARATOR = "\\n";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public <T> StreamingResponseBody exportToCsv(List<T> data, Class<T> clazz) {
        return outputStream -> {
            try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream))) {
                // Write header
                List<Field> fields = getExportableFields(clazz);
                String header = fields.stream()
                    .map(Field::getName)
                    .map(this::toHeaderName)
                    .reduce((a, b) -> a + DELIMITER + b)
                    .orElse("");
                writer.println(header);

                // Write data rows
                for (T item : data) {
                    String row = fields.stream()
                        .map(field -> getFieldValue(item, field))
                        .map(this::escapeCsvValue)
                        .reduce((a, b) -> a + DELIMITER + b)
                        .orElse("");
                    writer.println(row);
                }

                writer.flush();
                log.info("Exported {} records to CSV", data.size());
            }
        };
    }

    public <T> StreamingResponseBody exportToCsvWithStream(Stream<T> dataStream, Class<T> clazz) {
        return outputStream -> {
            try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream))) {
                List<Field> fields = getExportableFields(clazz);

                // Write header
                String header = fields.stream()
                    .map(Field::getName)
                    .map(this::toHeaderName)
                    .reduce((a, b) -> a + DELIMITER + b)
                    .orElse("");
                writer.println(header);

                // Stream data rows
                dataStream.forEach(item -> {
                    String row = fields.stream()
                        .map(field -> getFieldValue(item, field))
                        .map(this::escapeCsvValue)
                        .reduce((a, b) -> a + DELIMITER + b)
                        .orElse("");
                    writer.println(row);
                });

                writer.flush();
            }
        };
    }

    public <T> StreamingResponseBody exportWithCustomMapping(
            List<T> data,
            LinkedHashMap<String, Function<T, Object>> columnMappings) {

        return outputStream -> {
            try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream))) {
                // Write header
                String header = String.join(DELIMITER, columnMappings.keySet());
                writer.println(header);

                // Write data rows
                for (T item : data) {
                    String row = columnMappings.values().stream()
                        .map(mapper -> mapper.apply(item))
                        .map(this::formatValue)
                        .map(this::escapeCsvValue)
                        .reduce((a, b) -> a + DELIMITER + b)
                        .orElse("");
                    writer.println(row);
                }

                writer.flush();
            }
        };
    }

    public void exportToFile(List<${className}> data, String filePath) throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath))) {
            // Header
            writer.println("Id,Name,Status,CreatedAt,UpdatedAt");

            // Data
            for (${className} item : data) {
                writer.printf("%s,%s,%s,%s,%s%n",
                    escapeCsvValue(item.getId()),
                    escapeCsvValue(item.getName()),
                    escapeCsvValue(item.getStatus()),
                    formatDateTime(item.getCreatedAt()),
                    formatDateTime(item.getUpdatedAt())
                );
            }
        }

        log.info("Exported {} records to file: {}", data.size(), filePath);
    }

    private List<Field> getExportableFields(Class<?> clazz) {
        List<Field> fields = new ArrayList<>();
        for (Field field : clazz.getDeclaredFields()) {
            if (!java.lang.reflect.Modifier.isStatic(field.getModifiers()) &&
                !field.getName().startsWith("$")) {
                field.setAccessible(true);
                fields.add(field);
            }
        }
        return fields;
    }

    private String getFieldValue(Object obj, Field field) {
        try {
            Object value = field.get(obj);
            return formatValue(value);
        } catch (IllegalAccessException e) {
            return "";
        }
    }

    private String formatValue(Object value) {
        if (value == null) return "";
        if (value instanceof LocalDateTime dt) return dt.format(DATETIME_FORMATTER);
        if (value instanceof LocalDate d) return d.format(DATE_FORMATTER);
        if (value instanceof Collection<?> c) return String.valueOf(c.size());
        return value.toString();
    }

    private String escapeCsvValue(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private String toHeaderName(String fieldName) {
        // Convert camelCase to Title Case
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < fieldName.length(); i++) {
            char c = fieldName.charAt(i);
            if (i == 0) {
                result.append(Character.toUpperCase(c));
            } else if (Character.isUpperCase(c)) {
                result.append(" ").append(c);
            } else {
                result.append(c);
            }
        }
        return result.toString();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : "";
    }
}
`,
      language: 'java'
    })
  }
};
