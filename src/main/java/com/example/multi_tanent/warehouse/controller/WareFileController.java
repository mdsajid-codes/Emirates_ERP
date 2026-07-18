package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.service.WareStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/warehouse/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WareFileController {

    private final WareStorageService storageService;

    @GetMapping("/view")
    public ResponseEntity<Resource> viewFile(@RequestParam String path, HttpServletRequest request) {
        try {
            Resource resource = storageService.loadFileAsResource(path);
            
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                // fallback
            }

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
