package com.example.multi_tanent.accounts.service.impl;

import com.example.multi_tanent.accounts.dto.investment.AccCashEquivalentRequest;
import com.example.multi_tanent.accounts.dto.investment.AccCashEquivalentResponse;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryResponse;
import com.example.multi_tanent.accounts.entity.AccBankAccount;
import com.example.multi_tanent.accounts.entity.AccCashEquivalent;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.CashEquivStatus;
import com.example.multi_tanent.accounts.repository.AccBankAccountRepository;
import com.example.multi_tanent.accounts.repository.AccCashEquivalentRepository;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.service.AccCashEquivalentService;
import com.example.multi_tanent.accounts.service.journal.JournalEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccCashEquivalentServiceImpl implements AccCashEquivalentService {

    private final AccCashEquivalentRepository cashEquivalentRepository;
    private final AccBankAccountRepository bankAccountRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final JournalEntryService journalEntryService;

    @Override
    @Transactional
    public AccCashEquivalentResponse invest(AccCashEquivalentRequest request, String tenantId) {
        AccBankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId())
                .orElseThrow(() -> new RuntimeException("Bank Account not found"));

        ChartOfAccount ceGlAccount = request.getGlAccountId() != null ?
                chartOfAccountRepository.findById(request.getGlAccountId()).orElseThrow(() -> new RuntimeException("GL Account not found"))
                : null; // Typically we would have a system default

        AccCashEquivalent investment = AccCashEquivalent.builder()
                .name(request.getName())
                .bankAccount(bankAccount)
                .amount(request.getAmount())
                .investmentDate(request.getInvestmentDate())
                .maturityDate(request.getMaturityDate())
                .interestRate(request.getInterestRate())
                .glAccount(ceGlAccount)
                .status(CashEquivStatus.ACTIVE)
                .tenantId(tenantId)
                .build();

        // GL Entry for investment
        JournalEntryRequest jeReq = new JournalEntryRequest();
        jeReq.setEntryDate(request.getInvestmentDate());
        jeReq.setReferenceNumber("CE-INV-" + System.currentTimeMillis());
        jeReq.setDescription("Investment: " + request.getName());

        List<JournalEntryRequest.JournalEntryLineRequest> lines = new ArrayList<>();
        // Debit Cash Equivalents
        JournalEntryRequest.JournalEntryLineRequest debitCe = new JournalEntryRequest.JournalEntryLineRequest();
        debitCe.setAccountId(ceGlAccount != null ? ceGlAccount.getAccountId() : 1L); // Fallback for testing
        debitCe.setDebitAmount(request.getAmount());
        debitCe.setDescription(request.getName());
        lines.add(debitCe);

        // Credit Bank
        JournalEntryRequest.JournalEntryLineRequest creditBank = new JournalEntryRequest.JournalEntryLineRequest();
        creditBank.setAccountId(bankAccount.getGlAccount().getAccountId());
        creditBank.setCreditAmount(request.getAmount());
        creditBank.setDescription("Investment Payment");
        lines.add(creditBank);

        jeReq.setLines(lines);

        JournalEntryResponse jeRes = journalEntryService.createDraft(jeReq, tenantId);
        journalEntryService.post(jeRes.getJournalEntryId(), tenantId);

        com.example.multi_tanent.accounts.entity.journal.JournalEntry jeEntity = new com.example.multi_tanent.accounts.entity.journal.JournalEntry();
        jeEntity.setJournalEntryId(jeRes.getJournalEntryId());
        investment.setJournalEntry(jeEntity);

        investment = cashEquivalentRepository.save(investment);
        return mapToResponse(investment);
    }

    @Override
    @Transactional
    public AccCashEquivalentResponse mature(Long id, String tenantId) {
        AccCashEquivalent investment = cashEquivalentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found"));

        if (!investment.getTenantId().equals(tenantId)) throw new RuntimeException("Investment not found for tenant");
        if (investment.getStatus() != CashEquivStatus.ACTIVE) throw new RuntimeException("Only ACTIVE investments can be matured");

        // Calculate simple interest
        long days = ChronoUnit.DAYS.between(investment.getInvestmentDate(), investment.getMaturityDate());
        BigDecimal interestRateDecimal = investment.getInterestRate().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
        BigDecimal earnedInterest = investment.getAmount()
                .multiply(interestRateDecimal)
                .multiply(new BigDecimal(days))
                .divide(new BigDecimal("365"), 2, RoundingMode.HALF_UP);

        BigDecimal totalMaturityAmount = investment.getAmount().add(earnedInterest);

        // GL Entry for maturity
        JournalEntryRequest jeReq = new JournalEntryRequest();
        jeReq.setEntryDate(LocalDate.now()); // Or use maturityDate depending on business logic
        jeReq.setReferenceNumber("CE-MAT-" + investment.getId());
        jeReq.setDescription("Maturity: " + investment.getName());

        List<JournalEntryRequest.JournalEntryLineRequest> lines = new ArrayList<>();
        
        // Debit Bank (Total)
        JournalEntryRequest.JournalEntryLineRequest debitBank = new JournalEntryRequest.JournalEntryLineRequest();
        debitBank.setAccountId(investment.getBankAccount().getGlAccount().getAccountId());
        debitBank.setDebitAmount(totalMaturityAmount);
        debitBank.setDescription("Maturity Proceeds");
        lines.add(debitBank);

        // Credit Cash Equivalents (Principal)
        JournalEntryRequest.JournalEntryLineRequest creditCe = new JournalEntryRequest.JournalEntryLineRequest();
        creditCe.setAccountId(investment.getGlAccount() != null ? investment.getGlAccount().getAccountId() : 1L);
        creditCe.setCreditAmount(investment.getAmount());
        creditCe.setDescription("Principal Return");
        lines.add(creditCe);

        // Credit Interest Income
        JournalEntryRequest.JournalEntryLineRequest creditInterest = new JournalEntryRequest.JournalEntryLineRequest();
        // Assuming there is a setup config for Interest Income GL. For now mock to 2L or system configured.
        creditInterest.setAccountId(2L); // Placeholder for Interest Income GL
        creditInterest.setCreditAmount(earnedInterest);
        creditInterest.setDescription("Earned Interest");
        lines.add(creditInterest);

        jeReq.setLines(lines);

        JournalEntryResponse jeRes = journalEntryService.createDraft(jeReq, tenantId);
        journalEntryService.post(jeRes.getJournalEntryId(), tenantId);

        com.example.multi_tanent.accounts.entity.journal.JournalEntry jeEntity = new com.example.multi_tanent.accounts.entity.journal.JournalEntry();
        jeEntity.setJournalEntryId(jeRes.getJournalEntryId());
        
        investment.setMaturityJournal(jeEntity);
        investment.setStatus(CashEquivStatus.MATURED);

        investment = cashEquivalentRepository.save(investment);
        return mapToResponse(investment);
    }

    @Override
    public AccCashEquivalentResponse getInvestment(Long id, String tenantId) {
        AccCashEquivalent investment = cashEquivalentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found"));
        if (!investment.getTenantId().equals(tenantId)) throw new RuntimeException("Investment not found for tenant");
        return mapToResponse(investment);
    }

    @Override
    public List<AccCashEquivalentResponse> getAllInvestments(String tenantId) {
        return cashEquivalentRepository.findByTenantId(tenantId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AccCashEquivalentResponse mapToResponse(AccCashEquivalent ce) {
        AccCashEquivalentResponse res = new AccCashEquivalentResponse();
        res.setId(ce.getId());
        res.setName(ce.getName());
        res.setBankAccountId(ce.getBankAccount() != null ? ce.getBankAccount().getId() : null);
        res.setAmount(ce.getAmount());
        res.setInvestmentDate(ce.getInvestmentDate());
        res.setMaturityDate(ce.getMaturityDate());
        res.setInterestRate(ce.getInterestRate());
        res.setGlAccountId(ce.getGlAccount() != null ? ce.getGlAccount().getAccountId() : null);
        res.setStatus(ce.getStatus());
        res.setJournalEntryId(ce.getJournalEntry() != null ? ce.getJournalEntry().getJournalEntryId() : null);
        res.setMaturityJournalId(ce.getMaturityJournal() != null ? ce.getMaturityJournal().getJournalEntryId() : null);
        res.setTenantId(ce.getTenantId());
        return res;
    }
}
