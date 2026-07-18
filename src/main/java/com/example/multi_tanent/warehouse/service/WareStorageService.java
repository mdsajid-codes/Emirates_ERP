package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.config.FileStorageProperties;
import com.example.multi_tanent.config.TenantContext;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class WareStorageService {

    private final Path fileStorageLocation;

    public WareStorageService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();
    }

    public String storeProductFile(byte[] fileBytes, String originalFileName, String tenantId) throws IOException {
        String subPath = "warehouse/product";
        String extension = getFileExtension(originalFileName);
        String fileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_")
                + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, fileBytes);

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storeProductFile(MultipartFile file, String tenantId) throws IOException {
        return storeProductFile(file.getBytes(), file.getOriginalFilename(), tenantId);
    }

    public String storeVehicleDocumentFile(MultipartFile file, String tenantId, String plateNumber) throws IOException {
        String subPath = "fleet/vehicle/documents";
        String extension = getFileExtension(file.getOriginalFilename());
        String fileName = System.currentTimeMillis() + "_" + plateNumber.replaceAll("[^a-zA-Z0-9.-]", "_")
                + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, file.getBytes());

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storeDriverDocumentFile(MultipartFile file, String tenantId, String employeeCode) throws IOException {
        String subPath = "fleet/driver/documents";
        String extension = getFileExtension(file.getOriginalFilename());
        String fileName = System.currentTimeMillis() + "_" + employeeCode.replaceAll("[^a-zA-Z0-9.-]", "_")
                + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, file.getBytes());

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storeDriverProfileFile(MultipartFile file, String tenantId, String employeeCode) throws IOException {
        String subPath = "fleet/driver";
        String extension = getFileExtension(file.getOriginalFilename());
        String fileName = System.currentTimeMillis() + "_" + employeeCode.replaceAll("[^a-zA-Z0-9.-]", "_")
                + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, file.getBytes());

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storePodSignature(MultipartFile file, String tenantId) throws IOException {
        String subPath = "fleet/pod/signature";
        String extension = getFileExtension(file.getOriginalFilename());
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_")
                + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, file.getBytes());

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storePodPhoto(MultipartFile file, String tenantId) throws IOException {
        String subPath = "fleet/pod/photo";
        String extension = getFileExtension(file.getOriginalFilename());
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_")
                + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, file.getBytes());

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storeBinFile(byte[] fileBytes, String binCode, String tenantId) throws IOException {
        String subPath = "warehouse/bin";
        // milli_code.extension
        String fileName = System.currentTimeMillis() + "_" + binCode.replaceAll("[^a-zA-Z0-9.-]", "_") + ".png";

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, fileBytes);

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storeShelfFile(byte[] fileBytes, String shelfCode, String tenantId) throws IOException {
        String subPath = "warehouse/shelf";
        String fileName = System.currentTimeMillis() + "_" + shelfCode.replaceAll("[^a-zA-Z0-9.-]", "_") + ".png";

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, fileBytes);

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storeRackFile(byte[] fileBytes, String rackCode, String tenantId) throws IOException {
        String subPath = "warehouse/rack";
        String fileName = System.currentTimeMillis() + "_" + rackCode.replaceAll("[^a-zA-Z0-9.-]", "_") + ".png";

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, fileBytes);

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public String storeFile(MultipartFile file, String subPath, String tenantId) throws IOException {
        String extension = getFileExtension(file.getOriginalFilename());
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_")
                + (extension.isEmpty() ? "" : "." + extension);

        Path targetDir = this.fileStorageLocation.resolve(tenantId).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        Path targetLocation = targetDir.resolve(fileName);
        Files.write(targetLocation, file.getBytes());

        return Paths.get(tenantId, subPath, fileName).toString().replace("\\", "/");
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains("."))
            return "";
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}
