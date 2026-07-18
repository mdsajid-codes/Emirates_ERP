package com.example.multi_tanent.tenant.service;

import com.example.multi_tanent.config.FileStorageProperties;
import com.example.multi_tanent.config.TenantContext;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, String employeeCode) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName = employeeCode + "_" + System.currentTimeMillis() + "_"
                + originalFileName.replaceAll("[^a-zA-Z0-9._-]", "");

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public String storeFile(MultipartFile file, String subDirectory, boolean isTenantSpecific) {
        String tenantId = TenantContext.getTenantId();
        if (isTenantSpecific && (tenantId == null || tenantId.isBlank())) {
            throw new IllegalStateException("Cannot store file without a tenant context.");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9._-]", "");

        return storeFileInternal(file, subDirectory, fileName, isTenantSpecific);
    }

    public String storeFile(MultipartFile file, String subDirectory, String customFileName, boolean isTenantSpecific) {
        return storeFileInternal(file, subDirectory, customFileName, isTenantSpecific);
    }

    private String storeFileInternal(MultipartFile file, String subDirectory, String fileName,
            boolean isTenantSpecific) {
        String tenantId = TenantContext.getTenantId();
        if (isTenantSpecific && (tenantId == null || tenantId.isBlank())) {
            throw new IllegalStateException("Cannot store file without a tenant context.");
        }

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            Path targetDir = this.fileStorageLocation;
            if (isTenantSpecific) {
                targetDir = targetDir.resolve(tenantId);
            }
            targetDir = targetDir.resolve(subDirectory).normalize();

            Files.createDirectories(targetDir);

            Path targetLocation = targetDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return Paths.get(subDirectory, fileName).toString().replace("\\", "/");
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        return loadFileAsResource(fileName, false);
    }

    public Resource loadFileAsResource(String fileName, boolean isTenantSpecific) {
        try {
            Path filePath;
            if (isTenantSpecific) {
                String tenantId = TenantContext.getTenantId();
                if (tenantId == null || tenantId.isBlank()) {
                    throw new IllegalStateException("Cannot load tenant file without a tenant context.");
                }
                filePath = this.fileStorageLocation.resolve(tenantId).resolve(fileName).normalize();
            } else {
                filePath = this.fileStorageLocation.resolve(fileName).normalize();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + fileName, ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + fileName, ex);
        }
    }

    public Path getFileStorageLocation() {
        return fileStorageLocation;
    }

    /**
     * Stores a file from a byte array into a specified subdirectory.
     *
     * @param fileBytes    The byte array of the file to store.
     * @param subDirectory The subdirectory within the main upload directory (e.g.,
     *                     "barcodes", "logos").
     * @param filename     The desired filename.
     * @return The relative path to the stored file (e.g.,
     *         "barcodes/my-barcode.png").
     */
    public String storeFile(byte[] fileBytes, String subDirectory, String filename) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalStateException("Cannot store file without a tenant context.");
        }

        try {
            String cleanFilename = StringUtils.cleanPath(filename);
            if (cleanFilename.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + cleanFilename);
            }

            // Create tenant-specific path: <upload-dir>/<tenant-id>/<sub-dir>
            Path tenantDirPath = this.fileStorageLocation.resolve(tenantId).normalize();
            Path subDirPath = tenantDirPath.resolve(subDirectory).normalize();
            Files.createDirectories(subDirPath);

            Path targetLocation = subDirPath.resolve(cleanFilename);
            Files.write(targetLocation, fileBytes);

            return Paths.get(subDirectory, cleanFilename).toString().replace("\\", "/"); // Ensure consistent path
                                                                                         // separators
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + filename + ". Please try again!", ex);
        }
    }

    public String buildPublicUrl(String relativePath) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            return null;
        }
        // If relativePath is null, return null
        if (relativePath == null) {
            return null;
        }
        return buildFileUrl(relativePath, tenantId);
    }

    private String buildFileUrl(String relativePath, String tenantId) {
        // The relativePath from storeFile already includes the subdirectory (e.g.,
        // "barcodes/file.png")
        // We need to prepend the main upload path and the tenant ID.
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/") // This path must match MvcConfig's resource handler
                .path(tenantId + "/")
                .path(relativePath)
                .build()
                .toUriString();
    }

    private String getRelativePathFromFullUrl(String fullUrl) {
        // This is a helper to extract the storable part of the URL if needed for
        // deletion
        // e.g., "http://.../uploads/tenant1/barcodes/file.png" ->
        // "tenant1/barcodes/file.png"
        return fullUrl.substring(fullUrl.indexOf("/uploads/") + "/uploads/".length());
    }
}