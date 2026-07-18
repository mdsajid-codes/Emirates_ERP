package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.coa.PartyGLAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.PartyGLAccountResponse;
import com.example.multi_tanent.accounts.entity.enums.PartyType;
import com.example.multi_tanent.accounts.service.coa.PartyGLAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/party-gl")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'SUPER_ADMIN')")
public class PartyGLAccountController {

    private final PartyGLAccountService partyGLAccountService;

    private Map<String, Object> buildResponse(boolean success, String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> save(@RequestBody PartyGLAccountRequest request) {
        PartyGLAccountResponse response = partyGLAccountService.save(request);
        return ResponseEntity.ok(buildResponse(true, "Party GL Account mapping saved successfully", response));
    }

    @GetMapping("/{partyType}/{partyId}")
    public ResponseEntity<Map<String, Object>> getByTypeAndId(
            @PathVariable PartyType partyType,
            @PathVariable Long partyId) {
        PartyGLAccountResponse response = partyGLAccountService.getByTypeAndId(partyType, partyId);
        return ResponseEntity.ok(buildResponse(true, "Party GL Account mapping retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<PartyGLAccountResponse> response = partyGLAccountService.getAll();
        return ResponseEntity.ok(buildResponse(true, "All Party GL Account mappings retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        partyGLAccountService.delete(id);
        return ResponseEntity.ok(buildResponse(true, "Party GL Account mapping deleted successfully", null));
    }
}
