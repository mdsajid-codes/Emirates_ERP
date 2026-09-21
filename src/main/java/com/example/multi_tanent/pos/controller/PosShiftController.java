package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.entity.PosShift;
import com.example.multi_tanent.pos.repository.PosShiftRepository;
import com.example.multi_tanent.pos.service.PosShiftAccountingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pos/shifts")
@RequiredArgsConstructor
public class PosShiftController {

    private final PosShiftRepository shiftRepository;
    private final PosShiftAccountingService shiftAccountingService;

    @PostMapping("/open")
    public ResponseEntity<PosShift> openShift(@RequestBody OpenShiftRequest request, Authentication authentication) {
        String tenantId = (String) authentication.getDetails();
        String username = authentication.getName();

        PosShift shift = new PosShift();
        shift.setTenantId(tenantId);
        shift.setTerminalId(request.getTerminalId() != null ? request.getTerminalId() : "POS-TERM-1");
        shift.setCashierUserId(username);
        shift.setOpenedAt(LocalDateTime.now());
        shift.setOpeningCashCents(request.getOpeningCashCents() != null ? request.getOpeningCashCents() : 0L);
        shift.setStatus("OPEN");

        PosShift savedShift = shiftRepository.save(shift);
        return ResponseEntity.ok(savedShift);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<PosShift> closeShift(@PathVariable Long id, @RequestBody CloseShiftRequest request, Authentication authentication) {
        String username = authentication.getName();
        PosShift shift = shiftAccountingService.closeAndReconcileShift(id, request.getActualCashCents(), username);
        return ResponseEntity.ok(shift);
    }

    @GetMapping
    public ResponseEntity<List<PosShift>> getShifts(Authentication authentication) {
        String tenantId = (String) authentication.getDetails();
        List<PosShift> shifts = shiftRepository.findByTenantId(tenantId);
        return ResponseEntity.ok(shifts);
    }

    @Data
    public static class OpenShiftRequest {
        private String terminalId;
        private Long openingCashCents;
    }

    @Data
    public static class CloseShiftRequest {
        private Long actualCashCents;
    }
}
