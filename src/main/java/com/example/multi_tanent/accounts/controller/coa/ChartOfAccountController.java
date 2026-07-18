package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.coa.ChartOfAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.ChartOfAccountResponse;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import com.example.multi_tanent.accounts.entity.enums.DimensionType;
import com.example.multi_tanent.accounts.service.coa.ChartOfAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/coa")
@RequiredArgsConstructor
public class ChartOfAccountController {

    private final ChartOfAccountService coaService;

    private Map<String, Object> buildResponse(boolean success, String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createAccount(@RequestBody ChartOfAccountRequest request, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        ChartOfAccountResponse data = coaService.createAccount(request, username);
        return ResponseEntity.ok(buildResponse(true, "Account created successfully", data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateAccount(@PathVariable Long id, @RequestBody ChartOfAccountRequest request, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        ChartOfAccountResponse data = coaService.updateAccount(id, request, username);
        return ResponseEntity.ok(buildResponse(true, "Account updated successfully", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        ChartOfAccountResponse data = coaService.getById(id);
        return ResponseEntity.ok(buildResponse(true, "Account retrieved successfully", data));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Map<String, Object>> getByCode(@PathVariable String code) {
        ChartOfAccountResponse data = coaService.getByCode(code);
        return ResponseEntity.ok(buildResponse(true, "Account retrieved successfully", data));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAccounts() {
        List<ChartOfAccountResponse> data = coaService.getAll();
        return ResponseEntity.ok(buildResponse(true, "Accounts retrieved successfully", data));
    }

    @GetMapping("/tree")
    public ResponseEntity<Map<String, Object>> getTree() {
        List<Map<String, Object>> data = coaService.getTree();
        return ResponseEntity.ok(buildResponse(true, "COA tree retrieved successfully", data));
    }

    @GetMapping("/section/{section}")
    public ResponseEntity<Map<String, Object>> getBySection(@PathVariable AccountSection section) {
        List<ChartOfAccountResponse> data = coaService.getBySection(section);
        return ResponseEntity.ok(buildResponse(true, "Accounts retrieved successfully for section", data));
    }

    @GetMapping("/parent/{parentGroup}")
    public ResponseEntity<Map<String, Object>> getByParentGroup(@PathVariable String parentGroup) {
        List<ChartOfAccountResponse> data = coaService.getByParentGroup(parentGroup);
        return ResponseEntity.ok(buildResponse(true, "Accounts retrieved successfully for parent group", data));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> activate(@PathVariable Long id, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        ChartOfAccountResponse data = coaService.activate(id, username);
        return ResponseEntity.ok(buildResponse(true, "Account activated successfully", data));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> deactivate(@PathVariable Long id, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        ChartOfAccountResponse data = coaService.deactivate(id, username);
        return ResponseEntity.ok(buildResponse(true, "Account deactivated successfully", data));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAccount(@PathVariable Long id) {
        coaService.delete(id);
        return ResponseEntity.ok(buildResponse(true, "Account deleted successfully", null));
    }

    @GetMapping("/dropdown/sections")
    public ResponseEntity<Map<String, Object>> getSectionDropdown() {
        List<String> data = coaService.getSectionDropdown();
        return ResponseEntity.ok(buildResponse(true, "Sections retrieved successfully", data));
    }

    @GetMapping("/dropdown/parent-groups")
    public ResponseEntity<Map<String, Object>> getParentGroupDropdown() {
        List<String> data = coaService.getParentGroupDropdown();
        return ResponseEntity.ok(buildResponse(true, "Parent groups retrieved successfully", data));
    }

    @GetMapping("/dimension/{dimensionType}")
    public ResponseEntity<Map<String, Object>> getAccountsForDimension(@PathVariable DimensionType dimensionType) {
        List<ChartOfAccountResponse> data = coaService.getAccountsForDimension(dimensionType);
        return ResponseEntity.ok(buildResponse(true, "Accounts retrieved successfully for dimension type", data));
    }
}
