package com.example.multi_tanent.accounts.service.journal;

import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryResponse;
import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.exception.InvalidTransactionException;
import com.example.multi_tanent.accounts.repository.coa.ChartOfAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.JournalEntryRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class JournalEntryServiceImpl implements JournalEntryService {

    private final JournalEntryRepository entryRepository;
    private final ChartOfAccountRepository coaRepository;
    private final TenantRepository tenantRepository;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    private Tenant resolveCurrentTenant() {
        String tenantIdStr = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new IllegalStateException("Tenant context not initialized properly."));
    }

    @SneakyThrows
    private String toJson(Object obj) {
        return objectMapper.writeValueAsString(obj);
    }

    private synchronized String generateEntryNumber(LocalDate date, Long tenantId) {
        int year = date.getYear();
        String prefix = "JE-" + year + "-";
        long maxId = entryRepository.findMaxIdForYearPrefix(prefix + "%", tenantId);
        long sequence = maxId + 1;
        return prefix + String.format("%05d", sequence);
    }

    @Override
    public JournalEntryResponse createDraft(JournalEntryRequest request, String createdBy) {
        Tenant tenant = resolveCurrentTenant();

        String entryNumber = generateEntryNumber(request.getEntryDate(), tenant.getId());

        JournalEntry linkedInvoice = null;
        if (request.getLinkedInvoiceJeId() != null) {
            linkedInvoice = entryRepository.findById(request.getLinkedInvoiceJeId())
                    .orElseThrow(() -> new NoSuchElementException("Linked Invoice JE not found: " + request.getLinkedInvoiceJeId()));
        }

        JournalEntry entry = JournalEntry.builder()
                .entryNumber(entryNumber)
                .entryDate(request.getEntryDate())
                .dueDate(request.getDueDate())
                .documentType(request.getDocumentType())
                .description(request.getDescription())
                .companyId(request.getCompanyId())
                .referenceNumber(request.getReferenceNumber())
                .referenceId(request.getReferenceId())
                .status(JournalEntryStatus.DRAFT)
                .tenantId(tenant.getId())
                .createdBy(createdBy)
                .linkedInvoice(linkedInvoice)
                .build();

        mapLines(request.getLines(), entry);
        calculateTotals(entry);

        JournalEntry saved = entryRepository.save(entry);
        auditLogService.log("CREATE_DRAFT", "JournalEntry", saved.getJournalEntryId(), createdBy, null, toJson(toResponse(saved)));

        return toResponse(saved);
    }

    @Override
    @SneakyThrows
    public JournalEntryResponse updateDraft(Long id, JournalEntryRequest request, String updatedBy) {
        JournalEntry entry = entryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Journal entry not found: " + id));

        if (entry.getStatus() != JournalEntryStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT entries can be updated.");
        }

        JournalEntryResponse oldState = toResponse(entry);

        entry.setEntryDate(request.getEntryDate());
        entry.setDueDate(request.getDueDate());
        entry.setDocumentType(request.getDocumentType());
        entry.setDescription(request.getDescription());
        entry.setCompanyId(request.getCompanyId());
        entry.setReferenceNumber(request.getReferenceNumber());
        entry.setReferenceId(request.getReferenceId());

        if (request.getLinkedInvoiceJeId() != null) {
            JournalEntry linkedInvoice = entryRepository.findById(request.getLinkedInvoiceJeId())
                    .orElseThrow(() -> new NoSuchElementException("Linked Invoice JE not found: " + request.getLinkedInvoiceJeId()));
            entry.setLinkedInvoice(linkedInvoice);
        } else {
            entry.setLinkedInvoice(null);
        }

        entry.getLines().clear();
        mapLines(request.getLines(), entry);
        calculateTotals(entry);

        JournalEntry saved = entryRepository.save(entry);
        auditLogService.log("UPDATE_DRAFT", "JournalEntry", saved.getJournalEntryId(), updatedBy, toJson(oldState), toJson(toResponse(saved)));

        return toResponse(saved);
    }

    @Override
    @SneakyThrows
    public JournalEntryResponse post(Long id, String postedBy) {
        JournalEntry entry = entryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Journal entry not found: " + id));

        if (entry.getStatus() != JournalEntryStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT entries can be posted.");
        }

        BigDecimal totalDebit = entry.getTotalDebit();
        BigDecimal totalCredit = entry.getTotalCredit();

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new InvalidTransactionException("Journal entry is not balanced. Dr: " + totalDebit + " Cr: " + totalCredit);
        }

        JournalEntryResponse oldState = toResponse(entry);

        entry.setStatus(JournalEntryStatus.POSTED);
        entry.setPostedDate(LocalDateTime.now());
        entry.setPostedBy(postedBy);

        JournalEntry saved = entryRepository.save(entry);
        auditLogService.log("POST", "JournalEntry", saved.getJournalEntryId(), postedBy, toJson(oldState), toJson(toResponse(saved)));

        return toResponse(saved);
    }

    @Override
    @SneakyThrows
    public JournalEntryResponse reverse(Long id, String reversedBy) {
        Tenant tenant = resolveCurrentTenant();
        JournalEntry original = entryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Journal entry not found: " + id));

        if (original.getStatus() != JournalEntryStatus.POSTED) {
            throw new IllegalStateException("Only POSTED entries can be reversed.");
        }
        if (original.getReversedBy() != null) {
            throw new IllegalStateException("Entry has already been reversed.");
        }

        JournalEntryResponse originalOldState = toResponse(original);

        LocalDate today = LocalDate.now();
        String entryNumber = generateEntryNumber(today, tenant.getId());

        JournalEntry reversal = JournalEntry.builder()
                .entryNumber(entryNumber)
                .entryDate(today)
                .documentType(original.getDocumentType())
                .description("REVERSAL OF " + original.getEntryNumber() + " - " + original.getDescription())
                .companyId(original.getCompanyId())
                .referenceNumber(original.getEntryNumber())
                .referenceId(original.getJournalEntryId())
                .status(JournalEntryStatus.POSTED)
                .postedDate(LocalDateTime.now())
                .postedBy(reversedBy)
                .reversalOf(original)
                .tenantId(tenant.getId())
                .createdBy(reversedBy)
                .build();

        // Swap Debits and Credits
        for (var line : original.getLines()) {
            JournalEntryLine revLine = JournalEntryLine.builder()
                    .lineNumber(line.getLineNumber())
                    .account(line.getAccount())
                    .debitAmount(line.getCreditAmount()) // Swap Dr/Cr
                    .creditAmount(line.getDebitAmount()) // Swap Dr/Cr
                    .quantity(line.getQuantity())
                    .description("Reversal line: " + line.getDescription())
                    .dimItemId(line.getDimItemId())
                    .dimWarehouse(line.getDimWarehouse())
                    .dimCompanyId(line.getDimCompanyId())
                    .dimContract(line.getDimContract())
                    .dimEmployeeId(line.getDimEmployeeId())
                    .dimExpenseItemId(line.getDimExpenseItemId())
                    .dimIncomeItemId(line.getDimIncomeItemId())
                    .dimBankAccountId(line.getDimBankAccountId())
                    .dimTaxTypeId(line.getDimTaxTypeId())
                    .dimCashFlowItemId(line.getDimCashFlowItemId())
                    .build();
            reversal.addLine(revLine);
        }

        calculateTotals(reversal);
        JournalEntry savedReversal = entryRepository.save(reversal);

        // Update original entry reference link
        original.setReversedBy(savedReversal);
        entryRepository.save(original);

        auditLogService.log("REVERSE", "JournalEntry", original.getJournalEntryId(), reversedBy, toJson(originalOldState), toJson(toResponse(original)));
        auditLogService.log("CREATE_REVERSAL", "JournalEntry", savedReversal.getJournalEntryId(), reversedBy, null, toJson(toResponse(savedReversal)));

        return toResponse(savedReversal);
    }

    @Override
    public JournalEntryResponse getById(Long id) {
        JournalEntry entry = entryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Journal entry not found with ID: " + id));
        JournalEntryResponse response = toResponse(entry);
        if (entry.getReferenceId() != null) {
            List<JournalEntry> related = entryRepository.findByReferenceIdAndTenant(entry.getReferenceId(), entry.getTenantId());
            List<JournalEntryResponse> relatedResponses = related.stream()
                    .filter(e -> !e.getJournalEntryId().equals(entry.getJournalEntryId()))
                    .map(this::toResponse)
                    .collect(Collectors.toList());
            response.setRelatedEntries(relatedResponses);
        }
        return response;
    }

    @Override
    public List<JournalEntryResponse> getAll(JournalEntryStatus status, DocumentType documentType, LocalDate from, LocalDate to) {
        Tenant tenant = resolveCurrentTenant();
        List<JournalEntry> entries = entryRepository.findAllByTenant(tenant.getId());

        return entries.stream()
                .filter(e -> status == null || e.getStatus() == status)
                .filter(e -> documentType == null || e.getDocumentType() == documentType)
                .filter(e -> from == null || !e.getEntryDate().isBefore(from))
                .filter(e -> to == null || !e.getEntryDate().isAfter(to))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JournalEntryResponse> getByStatus(JournalEntryStatus status) {
        Tenant tenant = resolveCurrentTenant();
        return entryRepository.findByStatusAndTenant(status, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JournalEntryResponse> getByDateRange(LocalDate from, LocalDate to) {
        Tenant tenant = resolveCurrentTenant();
        return entryRepository.findByEntryDateBetweenAndTenant(from, to, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JournalEntryResponse> getByDocumentType(DocumentType docType) {
        Tenant tenant = resolveCurrentTenant();
        return entryRepository.findByDocumentTypeAndTenant(docType, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        JournalEntry entry = entryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Journal entry not found: " + id));

        if (entry.getStatus() != JournalEntryStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT entries can be deleted.");
        }

        entryRepository.delete(entry);
    }

    private void mapLines(List<JournalEntryRequest.JournalEntryLineRequest> lineRequests, JournalEntry entry) {
        if (lineRequests == null) return;
        for (var reqLine : lineRequests) {
            ChartOfAccount account = coaRepository.findById(reqLine.getAccountId())
                    .orElseThrow(() -> new NoSuchElementException("Account not found: " + reqLine.getAccountId()));

            JournalEntryLine line = JournalEntryLine.builder()
                    .lineNumber(reqLine.getLineNumber())
                    .account(account)
                    .debitAmount(reqLine.getDebitAmount() != null ? reqLine.getDebitAmount() : BigDecimal.ZERO)
                    .creditAmount(reqLine.getCreditAmount() != null ? reqLine.getCreditAmount() : BigDecimal.ZERO)
                    .quantity(reqLine.getQuantity())
                    .description(reqLine.getDescription())
                    // Dimensions mapping
                    .dimItemId(reqLine.getDimItemId())
                    .dimWarehouse(reqLine.getDimWarehouse())
                    .dimCompanyId(reqLine.getDimCompanyId())
                    .dimContract(reqLine.getDimContract())
                    .dimEmployeeId(reqLine.getDimEmployeeId())
                    .dimExpenseItemId(reqLine.getDimExpenseItemId())
                    .dimIncomeItemId(reqLine.getDimIncomeItemId())
                    .dimBankAccountId(reqLine.getDimBankAccountId())
                    .dimTaxTypeId(reqLine.getDimTaxTypeId())
                    .dimCashFlowItemId(reqLine.getDimCashFlowItemId())
                    .build();

            entry.addLine(line);
        }
    }

    private void calculateTotals(JournalEntry entry) {
        BigDecimal totalDr = BigDecimal.ZERO;
        BigDecimal totalCr = BigDecimal.ZERO;

        for (var line : entry.getLines()) {
            totalDr = totalDr.add(line.getDebitAmount());
            totalCr = totalCr.add(line.getCreditAmount());
        }

        entry.setTotalDebit(totalDr);
        entry.setTotalCredit(totalCr);
    }

    private JournalEntryResponse toResponse(JournalEntry entry) {
        JournalEntryResponse resp = new JournalEntryResponse();
        resp.setJournalEntryId(entry.getJournalEntryId());
        resp.setEntryNumber(entry.getEntryNumber());
        resp.setEntryDate(entry.getEntryDate());
        resp.setDueDate(entry.getDueDate());
        resp.setDocumentType(entry.getDocumentType());
        resp.setDescription(entry.getDescription());
        resp.setCompanyId(entry.getCompanyId());
        resp.setReferenceNumber(entry.getReferenceNumber());
        resp.setReferenceId(entry.getReferenceId());
        resp.setTotalDebit(entry.getTotalDebit());
        resp.setTotalCredit(entry.getTotalCredit());
        resp.setStatus(entry.getStatus());
        resp.setPostedDate(entry.getPostedDate());
        resp.setPostedBy(entry.getPostedBy());
        resp.setCreatedBy(entry.getCreatedBy());
        resp.setCreatedAt(entry.getCreatedAt());

        if (entry.getReversedBy() != null) {
            resp.setReversedById(entry.getReversedBy().getJournalEntryId());
        }
        if (entry.getReversalOf() != null) {
            resp.setReversalOfId(entry.getReversalOf().getJournalEntryId());
        }
        if (entry.getLinkedInvoice() != null) {
            resp.setLinkedInvoiceJeId(entry.getLinkedInvoice().getJournalEntryId());
        }

        if (entry.getLines() != null) {
            resp.setLines(entry.getLines().stream().map(line -> {
                JournalEntryResponse.JournalEntryLineResponse lr = new JournalEntryResponse.JournalEntryLineResponse();
                lr.setLineId(line.getLineId());
                lr.setLineNumber(line.getLineNumber());
                lr.setAccountId(line.getAccount().getAccountId());
                lr.setAccountCode(line.getAccount().getAccountCode());
                lr.setAccountDescription(line.getAccount().getDescription());
                lr.setDebitAmount(line.getDebitAmount());
                lr.setCreditAmount(line.getCreditAmount());
                lr.setQuantity(line.getQuantity());
                lr.setDescription(line.getDescription());
                // Dimensions mapping
                lr.setDimItemId(line.getDimItemId());
                lr.setDimWarehouse(line.getDimWarehouse());
                lr.setDimCompanyId(line.getDimCompanyId());
                lr.setDimContract(line.getDimContract());
                lr.setDimEmployeeId(line.getDimEmployeeId());
                lr.setDimExpenseItemId(line.getDimExpenseItemId());
                lr.setDimIncomeItemId(line.getDimIncomeItemId());
                lr.setDimBankAccountId(line.getDimBankAccountId());
                lr.setDimTaxTypeId(line.getDimTaxTypeId());
                lr.setDimCashFlowItemId(line.getDimCashFlowItemId());
                return lr;
            }).collect(Collectors.toList()));
        }

        return resp;
    }
}
