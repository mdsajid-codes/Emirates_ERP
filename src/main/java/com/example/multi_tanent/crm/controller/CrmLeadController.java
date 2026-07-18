// package com.example.multi_tanent.crm.controller;

// import com.example.multi_tanent.crm.dto.CrmLeadRequest;
// import com.example.multi_tanent.crm.dto.CrmLeadResponse;
// import com.example.multi_tanent.crm.services.CrmLeadService;
// import jakarta.validation.Valid;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.domain.Sort;
// import org.springframework.data.web.PageableDefault;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/crm/leads")
// @RequiredArgsConstructor
// @CrossOrigin(origins = "*")
// public class CrmLeadController {

//     private final CrmLeadService leadService;

//     @PostMapping
//     public ResponseEntity<CrmLeadResponse> createLead(@Valid @RequestBody CrmLeadRequest request) {
//         return new ResponseEntity<>(leadService.createLead(request), HttpStatus.CREATED);
//     }

//     @GetMapping
//     public Page<CrmLeadResponse> getAllLeads(@PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
//         return leadService.getAllLeads(pageable);
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<CrmLeadResponse> getLeadById(@PathVariable Long id) {
//         return ResponseEntity.ok(leadService.getLeadById(id));
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<CrmLeadResponse> updateLead(@PathVariable Long id, @Valid @RequestBody CrmLeadRequest request) {
//         return ResponseEntity.ok(leadService.updateLead(id, request));
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
//         leadService.deleteLead(id);
//         return ResponseEntity.noContent().build();
//     }
// }

package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.LeadFilterRequest;
import com.example.multi_tanent.crm.dto.CrmLeadRequest;
import com.example.multi_tanent.crm.dto.CrmLeadResponse;
import com.example.multi_tanent.crm.dto.CrmLeadStatusUpdateRequest;
import com.example.multi_tanent.crm.dto.CrmLeadStageUpdateRequest;
import com.example.multi_tanent.crm.dto.BulkAssignOwnerRequest;
import com.example.multi_tanent.crm.services.CrmLeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.multi_tanent.crm.dto.BulkUploadResultDto;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/api/crm/leads")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmLeadController {

    private final CrmLeadService service;

    @PostMapping
    @PreAuthorize("@crmAccess.canCreate('LEAD')")
    public ResponseEntity<CrmLeadResponse> create(@Valid @RequestBody CrmLeadRequest req) {
        return new ResponseEntity<>(service.createLead(req), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("@crmAccess.canView('LEAD')")
    public Page<CrmLeadResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String period,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        LeadFilterRequest filter = LeadFilterRequest.builder()
                .q(q)
                .status(status)
                .ownerId(ownerId)
                .period(period)
                .build();
        return service.getAllLeads(filter, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmAccess.canView('LEAD')")
    public ResponseEntity<CrmLeadResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getLeadById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmAccess.canUpdate('LEAD')")
    public ResponseEntity<CrmLeadResponse> update(@PathVariable Long id, @Valid @RequestBody CrmLeadRequest req) {
        return ResponseEntity.ok(service.updateLead(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@crmAccess.canDelete('LEAD')")
    public void delete(@PathVariable Long id) {
        service.deleteLead(id);
    }

    @DeleteMapping("/bulk")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@crmAccess.canDelete('LEAD')")
    public void bulkDelete(@RequestParam List<Long> ids) {
        service.bulkDeleteLeads(ids);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("@crmAccess.canUpdate('LEAD')")
    public ResponseEntity<CrmLeadResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody CrmLeadStatusUpdateRequest req) {
        return ResponseEntity.ok(service.updateLeadStatus(id, req.getStatus()));
    }

    @PutMapping("/{id}/stage")
    @PreAuthorize("@crmAccess.canUpdate('LEAD')")
    public ResponseEntity<CrmLeadResponse> updateCurrentStage(@PathVariable Long id, @Valid @RequestBody CrmLeadStageUpdateRequest req) {
        return ResponseEntity.ok(service.updateLeadStage(id, req.getStageId()));
    }

    @GetMapping("/export")
    @PreAuthorize("@crmAccess.canExport('LEAD')")
    public void export(@RequestParam List<Long> ids, HttpServletResponse response) throws IOException {
        service.exportLeadsToCsv(ids, response);
    }

    @PutMapping("/bulk-assign-owner")
    @PreAuthorize("@crmAccess.canChangeOwner('LEAD')")
    public ResponseEntity<java.util.Map<String, Integer>> bulkAssignOwner(@Valid @RequestBody BulkAssignOwnerRequest req) {
        int updatedCount = service.bulkAssignOwner(req.getLeadIds(), req.getOwnerId());
        return ResponseEntity.ok(java.util.Map.of("updatedCount", updatedCount));
    }

    @GetMapping("/bulk-template")
    @PreAuthorize("@crmAccess.canImport('LEAD')")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        service.generateExcelTemplate(response);
    }

    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@crmAccess.canImport('LEAD')")
    public ResponseEntity<BulkUploadResultDto> bulkUpload(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(service.bulkUploadLeads(file));
    }
}
