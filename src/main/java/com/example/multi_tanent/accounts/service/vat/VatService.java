package com.example.multi_tanent.accounts.service.vat;

import com.example.multi_tanent.accounts.dto.vat.*;

import java.time.LocalDate;
import java.util.List;

public interface VatService {

    // VAT Group
    VatGroupResponse createGroup(VatGroupRequest request, String tenantId);
    VatGroupResponse updateGroup(Long id, VatGroupRequest request, String tenantId);
    void deleteGroup(Long id, String tenantId);
    List<VatGroupResponse> getAllGroups(String tenantId);

    // VAT Type
    VatTypeResponse createType(VatTypeRequest request, String tenantId);
    VatTypeResponse updateType(Long id, VatTypeRequest request, String tenantId);
    void deleteType(Long id, String tenantId);
    List<VatTypeResponse> getAllTypes(String tenantId);

    // VAT Rate
    VatRateResponse createRate(VatRateRequest request, String tenantId);
    VatRateResponse updateRate(Long id, VatRateRequest request, String tenantId);
    void deleteRate(Long id, String tenantId);
    List<VatRateResponse> getAllRates(String tenantId);

    // Tax Transactions
    TaxTransactionResponse createTaxTransaction(TaxTransactionRequest request, String tenantId);
    List<TaxTransactionResponse> getAllTaxTransactions(String tenantId);

    // Reports and Calculations
    VatLiabilityResponse calculateVatLiability(LocalDate fromDate, LocalDate toDate, String tenantId);
    VatReturnResponse generateVatReturn(LocalDate fromDate, LocalDate toDate, String tenantId);
    void settleVatLiability(VatSettlementRequest request, String tenantId);
    
    List<VatTransactionLineResponse> getOutputVatTransactions(LocalDate fromDate, LocalDate toDate, String tenantId);
    List<VatTransactionLineResponse> getInputVatTransactions(LocalDate fromDate, LocalDate toDate, String tenantId);
}
