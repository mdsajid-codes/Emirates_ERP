package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.coa.ItemGLAccountRequest;
import com.example.multi_tanent.accounts.dto.coa.ItemGLAccountResponse;
import com.example.multi_tanent.accounts.service.coa.ItemGLAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/item-gl")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'SUPER_ADMIN')")
public class ItemGLAccountController {

    private final ItemGLAccountService itemGLAccountService;

    private Map<String, Object> buildResponse(boolean success, String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> save(@RequestBody ItemGLAccountRequest request) {
        ItemGLAccountResponse response = itemGLAccountService.save(request);
        return ResponseEntity.ok(buildResponse(true, "Item GL Account mapping saved successfully", response));
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> getByItemId(@PathVariable Long itemId) {
        ItemGLAccountResponse response = itemGLAccountService.getByItemId(itemId);
        return ResponseEntity.ok(buildResponse(true, "Item GL Account mapping retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<ItemGLAccountResponse> response = itemGLAccountService.getAll();
        return ResponseEntity.ok(buildResponse(true, "All Item GL Account mappings retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        itemGLAccountService.delete(id);
        return ResponseEntity.ok(buildResponse(true, "Item GL Account mapping deleted successfully", null));
    }
}
