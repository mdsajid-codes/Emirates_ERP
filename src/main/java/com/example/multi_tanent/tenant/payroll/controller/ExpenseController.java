package com.example.multi_tanent.tenant.payroll.controller;

import com.example.multi_tanent.tenant.payroll.dto.ExpenseRequest;
import com.example.multi_tanent.tenant.payroll.dto.ExpensePayoutRequest;
import com.example.multi_tanent.tenant.payroll.dto.ExpenseResponse;
import com.example.multi_tanent.tenant.payroll.entity.Expense;
import com.example.multi_tanent.tenant.payroll.entity.ExpenseFile;
import com.example.multi_tanent.tenant.payroll.service.ExpenseService;
import com.example.multi_tanent.tenant.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseController.class);
    private final ExpenseService expenseService;
    private final FileStorageService fileStorageService;

    public ExpenseController(ExpenseService expenseService, FileStorageService fileStorageService) {
        this.expenseService = expenseService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExpenseResponse> submitExpense(
            @RequestPart("expense") ExpenseRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {

        Expense newExpense = expenseService.submitExpense(request, files);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/expenses/{id}")
                .buildAndExpand(newExpense.getId()).toUri();
        return ResponseEntity.created(location).body(ExpenseResponse.fromEntity(newExpense));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses() {
        List<ExpenseResponse> expenses = expenseService.getAllExpenses().stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id)
                .map(expense -> ResponseEntity.ok(ExpenseResponse.fromEntity(expense)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/attachments/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> viewAttachment(@PathVariable Long fileId) {
        ExpenseFile expenseFile = expenseService.getExpenseFileById(fileId);
        Resource resource = fileStorageService.loadFileAsResource(expenseFile.getFilePath());

        String contentType = "application/octet-stream";
        try {
            Path path = resource.getFile().toPath();
            contentType = Files.probeContentType(path);
        } catch (IOException ex) {
            logger.warn("Could not determine content type for file: {}", resource.getFilename(), ex);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + expenseFile.getOriginalFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/employee/{employeeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByEmployeeCode(@PathVariable String employeeCode) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByEmployeeCode(employeeCode).stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(expenses);
    }

    // Other endpoints (approve, reject, delete) would go here...
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<ExpenseResponse> approveExpense(@PathVariable Long id) {
        Expense approvedExpense = expenseService.approveExpense(id);
        return ResponseEntity.ok(ExpenseResponse.fromEntity(approvedExpense));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<ExpenseResponse> rejectExpense(@PathVariable Long id) {
        Expense rejectedExpense = expenseService.rejectExpense(id);
        return ResponseEntity.ok(ExpenseResponse.fromEntity(rejectedExpense));
    }

    @PostMapping("/{id}/payout")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR')")
    public ResponseEntity<ExpenseResponse> payoutExpense(@PathVariable Long id, @Valid @RequestBody ExpensePayoutRequest payoutRequest) {
        Expense paidExpense = expenseService.payoutExpense(id, payoutRequest);
        return ResponseEntity.ok(ExpenseResponse.fromEntity(paidExpense));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}