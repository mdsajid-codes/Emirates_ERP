package com.example.multi_tanent.accounts.service.vat.impl;

import com.example.multi_tanent.accounts.dto.vat.*;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.entity.vat.TaxTransaction;
import com.example.multi_tanent.accounts.entity.vat.VatGroup;
import com.example.multi_tanent.accounts.entity.vat.VatRate;
import com.example.multi_tanent.accounts.entity.vat.VatType;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryRepository;
import com.example.multi_tanent.accounts.repository.vat.TaxTransactionRepository;
import com.example.multi_tanent.accounts.repository.vat.VatGroupRepository;
import com.example.multi_tanent.accounts.repository.vat.VatRateRepository;
import com.example.multi_tanent.accounts.repository.vat.VatTypeRepository;
import com.example.multi_tanent.accounts.service.journal.JournalEntryService;
import com.example.multi_tanent.accounts.service.vat.VatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VatServiceImpl implements VatService {

    private final VatGroupRepository vatGroupRepository;
    private final VatTypeRepository vatTypeRepository;
    private final VatRateRepository vatRateRepository;
    private final TaxTransactionRepository taxTransactionRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final JournalEntryService journalEntryService;
    private final JournalEntryRepository journalEntryRepository;

    // --- VAT Group ---

    @Override
    @Transactional
    public VatGroupResponse createGroup(VatGroupRequest request, String tenantId) {
        VatGroup group = VatGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .tenantId(tenantId)
                .build();
        return mapToResponse(vatGroupRepository.save(group));
    }

    @Override
    @Transactional
    public VatGroupResponse updateGroup(Long id, VatGroupRequest request, String tenantId) {
        VatGroup group = vatGroupRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("VAT Group not found"));
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        return mapToResponse(vatGroupRepository.save(group));
    }

    @Override
    @Transactional
    public void deleteGroup(Long id, String tenantId) {
        VatGroup group = vatGroupRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("VAT Group not found"));
        // TODO: check references before delete
        vatGroupRepository.delete(group);
    }

    @Override
    public List<VatGroupResponse> getAllGroups(String tenantId) {
        return vatGroupRepository.findByTenantId(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VatGroupResponse mapToResponse(VatGroup group) {
        VatGroupResponse res = new VatGroupResponse();
        res.setId(group.getId());
        res.setName(group.getName());
        res.setDescription(group.getDescription());
        return res;
    }

    // --- VAT Type ---

    @Override
    @Transactional
    public VatTypeResponse createType(VatTypeRequest request, String tenantId) {
        VatGroup group = vatGroupRepository.findByIdAndTenantId(request.getVatGroupId(), tenantId)
                .orElseThrow(() -> new RuntimeException("VAT Group not found"));
        ChartOfAccount recGl = chartOfAccountRepository.findById(request.getReceivableGlAccountId())
                .orElseThrow(() -> new RuntimeException("Receivable GL account not found"));
        ChartOfAccount payGl = chartOfAccountRepository.findById(request.getPayableGlAccountId())
                .orElseThrow(() -> new RuntimeException("Payable GL account not found"));

        VatType type = VatType.builder()
                .name(request.getName())
                .vatGroup(group)
                .receivableGlAccount(recGl)
                .payableGlAccount(payGl)
                .tenantId(tenantId)
                .build();
        return mapToResponse(vatTypeRepository.save(type));
    }

    @Override
    @Transactional
    public VatTypeResponse updateType(Long id, VatTypeRequest request, String tenantId) {
        VatType type = vatTypeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("VAT Type not found"));
        
        VatGroup group = vatGroupRepository.findByIdAndTenantId(request.getVatGroupId(), tenantId)
                .orElseThrow(() -> new RuntimeException("VAT Group not found"));
        ChartOfAccount recGl = chartOfAccountRepository.findById(request.getReceivableGlAccountId())
                .orElseThrow(() -> new RuntimeException("Receivable GL account not found"));
        ChartOfAccount payGl = chartOfAccountRepository.findById(request.getPayableGlAccountId())
                .orElseThrow(() -> new RuntimeException("Payable GL account not found"));

        type.setName(request.getName());
        type.setVatGroup(group);
        type.setReceivableGlAccount(recGl);
        type.setPayableGlAccount(payGl);

        return mapToResponse(vatTypeRepository.save(type));
    }

    @Override
    @Transactional
    public void deleteType(Long id, String tenantId) {
        VatType type = vatTypeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("VAT Type not found"));
        vatTypeRepository.delete(type);
    }

    @Override
    public List<VatTypeResponse> getAllTypes(String tenantId) {
        return vatTypeRepository.findByTenantId(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VatTypeResponse mapToResponse(VatType type) {
        VatTypeResponse res = new VatTypeResponse();
        res.setId(type.getId());
        res.setName(type.getName());
        res.setVatGroupId(type.getVatGroup().getId());
        res.setVatGroupName(type.getVatGroup().getName());
        res.setReceivableGlAccountId(type.getReceivableGlAccount().getAccountId());
        res.setReceivableGlAccountName(type.getReceivableGlAccount().getDescription());
        res.setPayableGlAccountId(type.getPayableGlAccount().getAccountId());
        res.setPayableGlAccountName(type.getPayableGlAccount().getDescription());
        return res;
    }

    // --- VAT Rate ---

    @Override
    @Transactional
    public VatRateResponse createRate(VatRateRequest request, String tenantId) {
        VatRate rate = VatRate.builder()
                .name(request.getName())
                .rate(request.getRate())
                .vatType(request.getVatType())
                .outOfScopeReason(request.getOutOfScopeReason())
                .tenantId(tenantId)
                .build();
        return mapToResponse(vatRateRepository.save(rate));
    }

    @Override
    @Transactional
    public VatRateResponse updateRate(Long id, VatRateRequest request, String tenantId) {
        VatRate rate = vatRateRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("VAT Rate not found"));
        rate.setName(request.getName());
        rate.setRate(request.getRate());
        rate.setVatType(request.getVatType());
        rate.setOutOfScopeReason(request.getOutOfScopeReason());
        return mapToResponse(vatRateRepository.save(rate));
    }

    @Override
    @Transactional
    public void deleteRate(Long id, String tenantId) {
        VatRate rate = vatRateRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("VAT Rate not found"));
        vatRateRepository.delete(rate);
    }

    @Override
    public List<VatRateResponse> getAllRates(String tenantId) {
        return vatRateRepository.findByTenantId(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VatRateResponse mapToResponse(VatRate rate) {
        VatRateResponse res = new VatRateResponse();
        res.setId(rate.getId());
        res.setName(rate.getName());
        res.setRate(rate.getRate());
        res.setVatType(rate.getVatType());
        res.setOutOfScopeReason(rate.getOutOfScopeReason());
        return res;
    }

    // --- Tax Transactions ---

    @Override
    @Transactional
    public TaxTransactionResponse createTaxTransaction(TaxTransactionRequest request, String tenantId) {
        TaxTransaction txn = TaxTransaction.builder()
                .transactionDate(request.getTransactionDate())
                .transactionType(request.getTransactionType())
                .paymentType(request.getPaymentType())
                .amount(request.getAmount())
                .description(request.getDescription())
                .tenantId(tenantId)
                .build();
        
        // TODO: Auto-post Journal Entry based on TransactionType
        
        return mapToResponse(taxTransactionRepository.save(txn));
    }

    @Override
    public List<TaxTransactionResponse> getAllTaxTransactions(String tenantId) {
        return taxTransactionRepository.findByTenantId(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TaxTransactionResponse mapToResponse(TaxTransaction txn) {
        TaxTransactionResponse res = new TaxTransactionResponse();
        res.setId(txn.getId());
        res.setTransactionDate(txn.getTransactionDate());
        res.setTransactionType(txn.getTransactionType());
        res.setPaymentType(txn.getPaymentType());
        res.setAmount(txn.getAmount());
        res.setDescription(txn.getDescription());
        if (txn.getJournalEntry() != null) {
            res.setJournalEntryId(txn.getJournalEntry().getJournalEntryId());
        }
        return res;
    }

    // --- Reports and Calculations ---
    
    @Override
    public VatLiabilityResponse calculateVatLiability(LocalDate fromDate, LocalDate toDate, String tenantId) {
        List<VatTransactionLineResponse> outputTxs = getOutputVatTransactions(fromDate, toDate, tenantId);
        List<VatTransactionLineResponse> inputTxs = getInputVatTransactions(fromDate, toDate, tenantId);
        
        BigDecimal totalOutputVat = outputTxs.stream()
                .map(VatTransactionLineResponse::getVatAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal totalInputVat = inputTxs.stream()
                .map(VatTransactionLineResponse::getVatAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        VatLiabilityResponse res = new VatLiabilityResponse();
        res.setFromDate(fromDate);
        res.setToDate(toDate);
        res.setTotalOutputVat(totalOutputVat);
        res.setTotalInputVat(totalInputVat);
        res.setNetVatLiability(totalOutputVat.subtract(totalInputVat));
        return res;
    }

    @Override
    public VatReturnResponse generateVatReturn(LocalDate fromDate, LocalDate toDate, String tenantId) {
        VatReturnResponse res = new VatReturnResponse();
        res.setFromDate(fromDate);
        res.setToDate(toDate);
        
        Map<String, VatReturnResponse.BoxData> boxes = new HashMap<>();
        // Mock data for FTA Boxes for now
        // Box 1: Standard rated supplies in Abu Dhabi
        VatReturnResponse.BoxData box1 = new VatReturnResponse.BoxData();
        box1.setDescription("Standard rated supplies in Abu Dhabi");
        box1.setAmount(BigDecimal.ZERO);
        box1.setVatAmount(BigDecimal.ZERO);
        boxes.put("1a", box1);
        
        // Populate boxes based on real data
        List<VatTransactionLineResponse> outputTxs = getOutputVatTransactions(fromDate, toDate, tenantId);
        for (VatTransactionLineResponse line : outputTxs) {
            box1.setAmount(box1.getAmount().add(line.getAmount()));
            box1.setVatAmount(box1.getVatAmount().add(line.getVatAmount()));
        }
        
        res.setBoxes(boxes);
        return res;
    }

    @Override
    @Transactional
    public void settleVatLiability(VatSettlementRequest request, String tenantId) {
        // Find VAT Payable account
        // Post entry: Dr VAT Payable / Cr Bank Account
        // Create JournalEntry
    }

    @Override
    public List<VatTransactionLineResponse> getOutputVatTransactions(LocalDate fromDate, LocalDate toDate, String tenantId) {
        java.util.List<VatTransactionLineResponse> responses = new java.util.ArrayList<>();
        
        // Query journal entries with DocumentType.SALES_INVOICE or similar
        // and lines where account is VAT Payable
        // (Currently mocked/empty for JournalEntries)
        
        // Add TaxTransactions
        List<TaxTransaction> taxTxns = taxTransactionRepository.findByTenantIdAndTransactionDateBetween(tenantId, fromDate, toDate);
        for (TaxTransaction txn : taxTxns) {
            if (txn.getTransactionType() == com.example.multi_tanent.accounts.entity.enums.TaxTransactionType.PAYABLE_INCREASE ||
                txn.getTransactionType() == com.example.multi_tanent.accounts.entity.enums.TaxTransactionType.PAYABLE_DECREASE) {
                
                VatTransactionLineResponse line = new VatTransactionLineResponse();
                line.setEntryDate(txn.getTransactionDate());
                line.setDocumentType(txn.getTransactionType().name());
                line.setDescription(txn.getDescription() != null ? txn.getDescription() : "Tax Adjustment");
                line.setAmount(BigDecimal.ZERO);
                
                BigDecimal vatAmount = txn.getAmount();
                if (txn.getTransactionType() == com.example.multi_tanent.accounts.entity.enums.TaxTransactionType.PAYABLE_DECREASE) {
                    vatAmount = vatAmount.negate();
                }
                line.setVatAmount(vatAmount);
                
                if (txn.getJournalEntry() != null) {
                    line.setJournalEntryId(txn.getJournalEntry().getJournalEntryId());
                    line.setJournalEntryNumber(txn.getJournalEntry().getEntryNumber());
                }
                responses.add(line);
            }
        }
        
        return responses;
    }

    @Override
    public List<VatTransactionLineResponse> getInputVatTransactions(LocalDate fromDate, LocalDate toDate, String tenantId) {
        java.util.List<VatTransactionLineResponse> responses = new java.util.ArrayList<>();
        
        // Query journal entries with DocumentType.PURCHASE_INVOICE or similar
        // and lines where account is VAT Receivable
        // (Currently mocked/empty for JournalEntries)
        
        // Add TaxTransactions
        List<TaxTransaction> taxTxns = taxTransactionRepository.findByTenantIdAndTransactionDateBetween(tenantId, fromDate, toDate);
        for (TaxTransaction txn : taxTxns) {
            if (txn.getTransactionType() == com.example.multi_tanent.accounts.entity.enums.TaxTransactionType.RECOVERABLE_INCREASE ||
                txn.getTransactionType() == com.example.multi_tanent.accounts.entity.enums.TaxTransactionType.RECOVERABLE_DECREASE) {
                
                VatTransactionLineResponse line = new VatTransactionLineResponse();
                line.setEntryDate(txn.getTransactionDate());
                line.setDocumentType(txn.getTransactionType().name());
                line.setDescription(txn.getDescription() != null ? txn.getDescription() : "Tax Adjustment");
                line.setAmount(BigDecimal.ZERO);
                
                BigDecimal vatAmount = txn.getAmount();
                if (txn.getTransactionType() == com.example.multi_tanent.accounts.entity.enums.TaxTransactionType.RECOVERABLE_DECREASE) {
                    vatAmount = vatAmount.negate();
                }
                line.setVatAmount(vatAmount);
                
                if (txn.getJournalEntry() != null) {
                    line.setJournalEntryId(txn.getJournalEntry().getJournalEntryId());
                    line.setJournalEntryNumber(txn.getJournalEntry().getEntryNumber());
                }
                responses.add(line);
            }
        }
        
        return responses;
    }
}
