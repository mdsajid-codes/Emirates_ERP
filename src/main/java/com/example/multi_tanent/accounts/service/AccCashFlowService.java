package com.example.multi_tanent.accounts.service;

import com.example.multi_tanent.accounts.dto.cashflow.CashFlowItemRequest;
import com.example.multi_tanent.accounts.dto.cashflow.CashFlowItemResponse;
import com.example.multi_tanent.accounts.dto.cashflow.CashFlowStatementResponse;
import com.example.multi_tanent.accounts.dto.cashflow.CashFlowTransactionRequest;
import com.example.multi_tanent.accounts.dto.cashflow.CashFlowTransactionResponse;

import java.time.LocalDate;
import java.util.List;

public interface AccCashFlowService {
    CashFlowItemResponse createItem(CashFlowItemRequest request, String tenantId);
    List<CashFlowItemResponse> getAllItems(String tenantId);

    CashFlowTransactionResponse createTransaction(CashFlowTransactionRequest request, String tenantId);
    List<CashFlowTransactionResponse> getAllTransactions(String tenantId);

    CashFlowStatementResponse generateCashFlowStatement(LocalDate from, LocalDate to, String tenantId);
}
