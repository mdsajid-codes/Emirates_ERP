package com.example.multi_tanent.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Component
@ConfigurationProperties(prefix = "file")
@Data
public class FileStorageProperties {
    /**
     * The directory where uploaded files will be stored. Can be overridden in application.yml.
     */
    private String uploadDir = "uploads/documents";
}