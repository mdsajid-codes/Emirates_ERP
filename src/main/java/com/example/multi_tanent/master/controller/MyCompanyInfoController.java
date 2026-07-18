package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.master.dto.MyCompanyInfoRequest;
import com.example.multi_tanent.master.dto.MyCompanyInfoResponse;
import com.example.multi_tanent.master.service.MyCompanyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@RequestMapping("/api/master/company-info")
@RequiredArgsConstructor
public class MyCompanyInfoController {

    private final MyCompanyInfoService companyInfoService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<MyCompanyInfoResponse> saveOrUpdateCompanyInfo(
            @ModelAttribute MyCompanyInfoRequest request) throws IOException {
        return ResponseEntity.ok(companyInfoService.saveOrUpdateCompanyInfo(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<MyCompanyInfoResponse> getCompanyInfo() {
        return ResponseEntity.ok(companyInfoService.getCompanyInfo());
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<MyCompanyInfoResponse> updateCompanyInfo(
            @ModelAttribute MyCompanyInfoRequest request) throws IOException {
        return ResponseEntity.ok(companyInfoService.saveOrUpdateCompanyInfo(request));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Void> deleteCompanyInfo() {
        companyInfoService.deleteCompanyInfo();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/images/{fileName:.+}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request)
            throws IOException {
        Resource resource = companyInfoService.loadFileAsResource(fileName);
        String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
