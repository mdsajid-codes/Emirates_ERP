package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.EmployeeBenefitProvisionRequest;
import com.example.multi_tanent.tenant.payroll.dto.EmployeeBenefitProvisionResponse;
import com.example.multi_tanent.tenant.payroll.dto.ProvisionPayoutRequest;
import com.example.multi_tanent.tenant.payroll.entity.EmployeeBenefitProvision;
import com.example.multi_tanent.tenant.payroll.service.PdfBenefitVoucherService;
import com.example.multi_tanent.tenant.payroll.service.EmployeeBenefitProvisionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.multi_tanent.tenant.payroll.enums.ProvisionStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/provisions")
@CrossOrigin(origins = "*") // Add this for cross-origin requests if needed
public class EmployeeBenefitProvisionController {

    private final EmployeeBenefitProvisionService provisionService;
    private final PdfBenefitVoucherService pdfVoucherService;

    public EmployeeBenefitProvisionController(EmployeeBenefitProvisionService provisionService, PdfBenefitVoucherService pdfVoucherService) {
        this.provisionService = provisionService;
        this.pdfVoucherService = pdfVoucherService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN')") // More restrictive for creation
    public ResponseEntity<EmployeeBenefitProvisionResponse> createProvision(@Valid @RequestBody EmployeeBenefitProvisionRequest request) {
        EmployeeBenefitProvision provision = provisionService.createProvision(request);
        return new ResponseEntity<>(EmployeeBenefitProvisionResponse.fromEntity(provision), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Allow any authenticated user to view if they have the ID
    public ResponseEntity<EmployeeBenefitProvisionResponse> getProvisionById(@PathVariable Long id) {
        EmployeeBenefitProvision provision = provisionService.getProvisionById(id);
        return ResponseEntity.ok(EmployeeBenefitProvisionResponse.fromEntity(provision));
    }

    @GetMapping("/employee/{employeeCode}")
    @PreAuthorize("isAuthenticated()") // Allow any authenticated user to view their own provisions
    public ResponseEntity<List<EmployeeBenefitProvisionResponse>> getProvisionsByEmployeeCode(@PathVariable String employeeCode) {
        List<EmployeeBenefitProvision> provisions = provisionService.getProvisionsByEmployeeCode(employeeCode);
        List<EmployeeBenefitProvisionResponse> response = provisions.stream()
                .map(EmployeeBenefitProvisionResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN')") // More restrictive for updates
    public ResponseEntity<EmployeeBenefitProvisionResponse> updateProvision(@PathVariable Long id, @Valid @RequestBody EmployeeBenefitProvisionRequest request) {
        EmployeeBenefitProvision updatedProvision = provisionService.updateProvision(id, request);
        return ResponseEntity.ok(EmployeeBenefitProvisionResponse.fromEntity(updatedProvision));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN')") // More restrictive for deletion
    public ResponseEntity<Void> deleteProvision(@PathVariable Long id) {
        provisionService.deleteProvision(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/payout") // Changed to POST to better handle multipart/form-data
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR')")
    public ResponseEntity<EmployeeBenefitProvisionResponse> markAsPaidOut(
            @PathVariable Long id,
            @Valid @RequestPart("payoutDetails") ProvisionPayoutRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        EmployeeBenefitProvision updatedProvision = provisionService.markAsPaidOut(id, request, files);
        return ResponseEntity.ok(EmployeeBenefitProvisionResponse.fromEntity(updatedProvision));
    }

    @GetMapping("/{id}/confirmation-file")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> viewConfirmationFile(@PathVariable Long id) {
        // Get the provision to access the filename, which is needed for the Content-Disposition header
        EmployeeBenefitProvision provision = provisionService.getProvisionById(id);
        Resource resource = provisionService.loadConfirmationFile(id);

        String contentType = "application/octet-stream";
        try {
            Path path = resource.getFile().toPath();
            contentType = Files.probeContentType(path);
        } catch (IOException ex) {
            // Log this error in a real app
            System.err.println("Could not determine content type for file: " + resource.getFilename());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                // "inline" suggests the browser should try to display the file, "attachment" forces download
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/download-voucher")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadPayoutVoucher(@PathVariable Long id) {
        return provisionService.getDataForVoucherPdf(id)
            .map(pdfData -> {
                if (pdfData.getProvision().getStatus() != ProvisionStatus.PAID_OUT) {
                    throw new IllegalStateException("Voucher can only be generated for PAID_OUT provisions.");
                }

                byte[] pdfBytes = pdfVoucherService.generateVoucher(pdfData);
                String filename = String.format("BenefitVoucher-%d-%s.pdf", id, pdfData.getProvision().getEmployee().getEmployeeCode());

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(pdfBytes);
            }).orElse(ResponseEntity.notFound().build());
    }
}