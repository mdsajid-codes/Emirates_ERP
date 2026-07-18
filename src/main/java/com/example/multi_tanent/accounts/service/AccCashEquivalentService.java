package com.example.multi_tanent.accounts.service;

import com.example.multi_tanent.accounts.dto.investment.AccCashEquivalentRequest;
import com.example.multi_tanent.accounts.dto.investment.AccCashEquivalentResponse;

import java.util.List;

public interface AccCashEquivalentService {
    AccCashEquivalentResponse invest(AccCashEquivalentRequest request, String tenantId);
    AccCashEquivalentResponse mature(Long id, String tenantId);
    AccCashEquivalentResponse getInvestment(Long id, String tenantId);
    List<AccCashEquivalentResponse> getAllInvestments(String tenantId);
}
