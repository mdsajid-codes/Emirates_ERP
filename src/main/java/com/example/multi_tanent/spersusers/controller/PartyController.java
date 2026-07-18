package com.example.multi_tanent.spersusers.controller;

import com.example.multi_tanent.spersusers.base.PartyBase;
import com.example.multi_tanent.spersusers.dto.OtherPersonRequest;
import com.example.multi_tanent.spersusers.dto.PagedResponse;
import com.example.multi_tanent.spersusers.dto.PartyRequest;
import com.example.multi_tanent.spersusers.dto.PartyResponse;
import com.example.multi_tanent.spersusers.service.PartyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/parties")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PartyController {

    private final PartyService partyService;

    @PostMapping
    public ResponseEntity<PartyResponse> create(@Valid @RequestBody PartyRequest request) {
        return new ResponseEntity<>(partyService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<PartyResponse>> getAll(
            @RequestParam(required = false) String type,
            @PageableDefault(size = 10) Pageable pageable) {
        PartyBase.PartyType partyType = null;
        if (type != null && !type.isEmpty()) {
            try {
                partyType = PartyBase.PartyType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid type or handle as needed
            }
        }
        Page<PartyResponse> page = partyService.getAll(partyType, pageable);
        return ResponseEntity.ok(new PagedResponse<>(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(partyService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartyResponse> update(@PathVariable Long id, @Valid @RequestBody PartyRequest request) {
        return ResponseEntity.ok(partyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        partyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{partyId}/other-persons")
    public ResponseEntity<?> addOtherPerson(@PathVariable Long partyId,
            @Valid @RequestBody OtherPersonRequest request) {
        return new ResponseEntity<>(partyService.addOtherPersonToParty(partyId, request), HttpStatus.CREATED);
    }

    // Other sub-resource endpoints can be added here...

    @PostMapping("/bulk-import")
    public ResponseEntity<?> bulkImportParties(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload an Excel file.");
        }
        try {
            List<String> errors = partyService.bulkImportParties(file);
            if (errors.isEmpty()) {
                return ResponseEntity.ok("Parties imported successfully.");
            } else {
                // Returning errors with a 207 Multi-Status or 400 Bad Request is also a good
                // option.
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process file: " + e.getMessage());
        }
    }

    @GetMapping("/bulk-template")
    public ResponseEntity<byte[]> downloadBulkTemplate() throws IOException {
        byte[] excelData = partyService.generateBulkUploadTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "party_bulk_import_template.xlsx");

        return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportParties() throws IOException {
        byte[] excelData = partyService.exportPartiesToExcel();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "parties_export.xlsx");

        return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
    }
}