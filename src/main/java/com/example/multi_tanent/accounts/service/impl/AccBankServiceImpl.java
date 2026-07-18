package com.example.multi_tanent.accounts.service.impl;

import com.example.multi_tanent.accounts.dto.payment.AccBankAccountRequest;
import com.example.multi_tanent.accounts.dto.payment.AccBankAccountResponse;
import com.example.multi_tanent.accounts.dto.payment.AccBankRequest;
import com.example.multi_tanent.accounts.dto.payment.AccBankResponse;
import com.example.multi_tanent.accounts.entity.AccBank;
import com.example.multi_tanent.accounts.entity.AccBankAccount;
import com.example.multi_tanent.accounts.repository.AccBankAccountRepository;
import com.example.multi_tanent.accounts.repository.AccBankRepository;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.service.AccBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccBankServiceImpl implements AccBankService {

    private final AccBankRepository bankRepository;
    private final AccBankAccountRepository bankAccountRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;

    @Override
    @Transactional
    public AccBankResponse createBank(AccBankRequest request, String tenantId) {
        AccBank bank = AccBank.builder()
                .name(request.getName())
                .swiftCode(request.getSwiftCode())
                .country(request.getCountry())
                .tenantId(tenantId)
                .build();
        bank = bankRepository.save(bank);
        return mapToResponse(bank);
    }

    @Override
    public AccBankResponse getBank(Long id, String tenantId) {
        AccBank bank = bankRepository.findById(id).orElseThrow(() -> new RuntimeException("Bank not found"));
        if (!bank.getTenantId().equals(tenantId)) throw new RuntimeException("Bank not found for tenant");
        return mapToResponse(bank);
    }

    @Override
    public List<AccBankResponse> getAllBanks(String tenantId) {
        return bankRepository.findByTenantId(tenantId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AccBankAccountResponse createBankAccount(AccBankAccountRequest request, String tenantId) {
        AccBank bank = bankRepository.findById(request.getBankId()).orElseThrow(() -> new RuntimeException("Bank not found"));
        com.example.multi_tanent.accounts.entity.coa.ChartOfAccount glAccount = chartOfAccountRepository.findById(request.getGlAccountId()).orElseThrow(() -> new RuntimeException("GL Account not found"));

        AccBankAccount account = AccBankAccount.builder()
                .bank(bank)
                .accountNumber(request.getAccountNumber())
                .accountName(request.getAccountName())
                .currencyId(request.getCurrencyId())
                .glAccount(glAccount)
                .openingBalance(request.getOpeningBalance())
                .openingDate(request.getOpeningDate())
                .isActive(true)
                .tenantId(tenantId)
                .build();
        account = bankAccountRepository.save(account);
        return mapToResponse(account);
    }

    @Override
    @Transactional
    public AccBankAccountResponse updateBankAccount(Long id, AccBankAccountRequest request, String tenantId) {
        AccBankAccount account = bankAccountRepository.findById(id).orElseThrow(() -> new RuntimeException("Bank Account not found"));
        if (!account.getTenantId().equals(tenantId)) throw new RuntimeException("Bank Account not found for tenant");
        
        AccBank bank = bankRepository.findById(request.getBankId()).orElseThrow(() -> new RuntimeException("Bank not found"));
        com.example.multi_tanent.accounts.entity.coa.ChartOfAccount glAccount = chartOfAccountRepository.findById(request.getGlAccountId()).orElseThrow(() -> new RuntimeException("GL Account not found"));

        account.setBank(bank);
        account.setAccountNumber(request.getAccountNumber());
        account.setAccountName(request.getAccountName());
        account.setCurrencyId(request.getCurrencyId());
        account.setGlAccount(glAccount);
        
        account = bankAccountRepository.save(account);
        return mapToResponse(account);
    }

    @Override
    public AccBankAccountResponse getBankAccount(Long id, String tenantId) {
        AccBankAccount account = bankAccountRepository.findById(id).orElseThrow(() -> new RuntimeException("Bank Account not found"));
        if (!account.getTenantId().equals(tenantId)) throw new RuntimeException("Bank Account not found for tenant");
        return mapToResponse(account);
    }

    @Override
    public List<AccBankAccountResponse> getAllBankAccounts(String tenantId) {
        return bankAccountRepository.findByTenantId(tenantId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<AccBankAccountResponse> getBankAccountsByBank(Long bankId, String tenantId) {
        return bankAccountRepository.findByBankIdAndTenantId(bankId, tenantId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AccBankResponse mapToResponse(AccBank bank) {
        AccBankResponse res = new AccBankResponse();
        res.setId(bank.getId());
        res.setName(bank.getName());
        res.setSwiftCode(bank.getSwiftCode());
        res.setCountry(bank.getCountry());
        res.setTenantId(bank.getTenantId());
        return res;
    }

    private AccBankAccountResponse mapToResponse(AccBankAccount account) {
        AccBankAccountResponse res = new AccBankAccountResponse();
        res.setId(account.getId());
        if (account.getBank() != null) {
            res.setBankId(account.getBank().getId());
            res.setBankName(account.getBank().getName());
        }
        res.setAccountNumber(account.getAccountNumber());
        res.setAccountName(account.getAccountName());
        res.setCurrencyId(account.getCurrencyId());
        if (account.getGlAccount() != null) {
            res.setGlAccountId(account.getGlAccount().getAccountId());
            res.setGlAccountCode(account.getGlAccount().getAccountCode());
            res.setGlAccountDescription(account.getGlAccount().getDescription());
        }
        res.setOpeningBalance(account.getOpeningBalance());
        res.setOpeningDate(account.getOpeningDate());
        res.setIsActive(account.getIsActive());
        return res;
    }
}
