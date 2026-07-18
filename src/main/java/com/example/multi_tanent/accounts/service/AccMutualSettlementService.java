package com.example.multi_tanent.accounts.service;

import com.example.multi_tanent.accounts.dto.settlement.AccMutualSettlementRequest;
import com.example.multi_tanent.accounts.dto.settlement.AccMutualSettlementResponse;

import java.util.List;

public interface AccMutualSettlementService {
    AccMutualSettlementResponse createDraft(AccMutualSettlementRequest request, String tenantId);
    AccMutualSettlementResponse postSettlement(Long id, String tenantId);
    AccMutualSettlementResponse reverseSettlement(Long id, String tenantId);
    AccMutualSettlementResponse getSettlement(Long id, String tenantId);
    List<AccMutualSettlementResponse> getAllSettlements(String tenantId);
}
