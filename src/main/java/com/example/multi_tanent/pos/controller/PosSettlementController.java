package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.entity.PosSettlement;
import com.example.multi_tanent.pos.repository.PosSettlementRepository;
import com.example.multi_tanent.pos.service.PosSettlementService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos/settlements")
@RequiredArgsConstructor
public class PosSettlementController {

    private final PosSettlementRepository settlementRepository;
    private final PosSettlementService settlementService;

    @PostMapping("/card-batch")
    public ResponseEntity<PosSettlement> processCardSettlementBatch(@RequestBody CardSettlementRequest request, Authentication authentication) {
        String tenantId = (String) authentication.getDetails();
        String username = authentication.getName();

        PosSettlement settlement = settlementService.processCardSettlementBatch(
                request.getSettlementRef(),
                request.getGrossAmountCents(),
                request.getMerchantFeeCents(),
                request.getBankAccountId(),
                tenantId,
                username
        );
        return ResponseEntity.ok(settlement);
    }

    @GetMapping
    public ResponseEntity<List<PosSettlement>> getSettlements(Authentication authentication) {
        String tenantId = (String) authentication.getDetails();
        List<PosSettlement> settlements = settlementRepository.findByTenantId(tenantId);
        return ResponseEntity.ok(settlements);
    }

    @Data
    public static class CardSettlementRequest {
        private String settlementRef;
        private Long grossAmountCents;
        private Long merchantFeeCents;
        private Long bankAccountId;
    }
}
