package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsBlacklistResponse;
import com.example.multi_tanent.ats.services.AtsBlacklistService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/blacklist")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsBlacklistController {

    private final AtsBlacklistService blacklistService;

    @GetMapping
    public ResponseEntity<Page<AtsBlacklistResponse>> getBlacklisted(
            @RequestParam String type,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(blacklistService.getBlacklisted(type, search, pageable));
    }

    @PostMapping("/unblock")
    public ResponseEntity<Integer> unblock(@RequestBody UnblockRequest request) {
        int count = blacklistService.unblock(request.getType(), request.getIds());
        return ResponseEntity.ok(count);
    }

    @PostMapping("/block")
    public ResponseEntity<Void> block(@RequestBody BlockRequest request) {
        blacklistService.block(request.getType(), request.getId(), request.getReason());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class UnblockRequest {
        private String type;
        private List<Long> ids;
    }

    @Data
    public static class BlockRequest {
        private String type;
        private Long id;
        private String reason;
    }
}
