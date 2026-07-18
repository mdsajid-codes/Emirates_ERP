package com.example.multi_tanent.accounts.service;

import com.example.multi_tanent.accounts.dto.payment.AccBankAccountRequest;
import com.example.multi_tanent.accounts.dto.payment.AccBankAccountResponse;
import com.example.multi_tanent.accounts.dto.payment.AccBankRequest;
import com.example.multi_tanent.accounts.dto.payment.AccBankResponse;

import java.util.List;

public interface AccBankService {
    AccBankResponse createBank(AccBankRequest request, String tenantId);
    AccBankResponse getBank(Long id, String tenantId);
    List<AccBankResponse> getAllBanks(String tenantId);

    AccBankAccountResponse createBankAccount(AccBankAccountRequest request, String tenantId);
    AccBankAccountResponse updateBankAccount(Long id, AccBankAccountRequest request, String tenantId);
    AccBankAccountResponse getBankAccount(Long id, String tenantId);
    List<AccBankAccountResponse> getAllBankAccounts(String tenantId);
    List<AccBankAccountResponse> getBankAccountsByBank(Long bankId, String tenantId);
}
