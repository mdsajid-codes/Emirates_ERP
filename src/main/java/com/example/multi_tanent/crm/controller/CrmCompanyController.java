package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CrmCompanyRequest;
import com.example.multi_tanent.crm.dto.CrmCompanyResponse;
import com.example.multi_tanent.crm.services.CrmCompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/crm/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CrmCompanyController {

    private final CrmCompanyService companyService;

    @PostMapping
    @PreAuthorize("@crmAccess.canCreate('COMPANY')")
    public ResponseEntity<CrmCompanyResponse> createCompany(@Valid @RequestBody CrmCompanyRequest request) {
        return new ResponseEntity<>(companyService.createCompany(request), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("@crmAccess.canView('COMPANY')")
    public List<CrmCompanyResponse> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmAccess.canView('COMPANY')")
    public ResponseEntity<CrmCompanyResponse> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmAccess.canUpdate('COMPANY')")
    public ResponseEntity<CrmCompanyResponse> updateCompany(@PathVariable Long id, @Valid @RequestBody CrmCompanyRequest request) {
        return ResponseEntity.ok(companyService.updateCompany(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmAccess.canDelete('COMPANY')")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    @PreAuthorize("@crmAccess.canImport('COMPANY')")
    public ResponseEntity<?> bulkCreateCompanies(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a file.");
        }
        try {
            List<String> errors = companyService.bulkCreateCompanies(file);
            if (errors.isEmpty()) {
                return ResponseEntity.ok("Companies imported successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process file: " + e.getMessage());
        }
    }

    @GetMapping("/bulk-template")
    @PreAuthorize("@crmAccess.canImport('COMPANY')")
    public ResponseEntity<byte[]> downloadBulkTemplate() throws IOException {
        return companyService.generateBulkUploadTemplate();
    }
}