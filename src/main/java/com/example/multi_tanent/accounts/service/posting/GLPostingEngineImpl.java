package com.example.multi_tanent.accounts.service.posting;

import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryResponse;
import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.service.journal.JournalEntryService;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class GLPostingEngineImpl implements GLPostingEngine {

    private final JournalEntryService journalEntryService;
    private final PostingRulesFactory postingRulesFactory;
    private final TenantRepository tenantRepository;

    private Tenant resolveCurrentTenant() {
        String tenantIdStr = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantIdStr)
                .orElseThrow(() -> new IllegalStateException("Tenant context not initialized properly."));
    }

    @Override
    public PostingResult postDocument(PostingRequest request, String username) {
        try {
            Tenant tenant = resolveCurrentTenant();

            log.info("Generating GL ledger entries for document type: {}, reference ID: {}, tenant: {}", 
                    request.getDocumentType(), request.getReferenceId(), tenant.getTenantId());

            // 1. Generate posting lines
            var entryLines = postingRulesFactory.generateLines(request, tenant.getId());

            // 2. Build the draft request
            JournalEntryRequest draftRequest = new JournalEntryRequest();
            draftRequest.setEntryDate(request.getEntryDate());
            draftRequest.setDueDate(request.getDueDate());
            draftRequest.setDocumentType(request.getDocumentType());
            draftRequest.setDescription(request.getDescription());
            draftRequest.setReferenceNumber(request.getReferenceNumber());
            draftRequest.setReferenceId(request.getReferenceId());
            draftRequest.setLinkedInvoiceJeId(request.getLinkedInvoiceJeId());
            draftRequest.setLines(entryLines);

            // 3. Create draft
            JournalEntryResponse draftResponse = journalEntryService.createDraft(draftRequest, username);

            // 4. Post draft immediately
            JournalEntryResponse postedResponse = journalEntryService.post(draftResponse.getJournalEntryId(), username);

            return PostingResult.builder()
                    .success(true)
                    .journalEntryId(postedResponse.getJournalEntryId())
                    .entryNumber(postedResponse.getEntryNumber())
                    .message("Document posted successfully to GL")
                    .build();

        } catch (Exception e) {
            log.error("Failed to post document: {}", e.getMessage(), e);
            return PostingResult.builder()
                    .success(false)
                    .message("Failed to post document to GL: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public PostingResult reverseDocument(Long journalEntryId, String username) {
        try {
            if (journalEntryId == null) {
                return PostingResult.builder()
                        .success(false)
                        .message("Journal Entry ID is null, nothing to reverse")
                        .build();
            }

            log.info("Reversing GL ledger entries for journal entry ID: {}", journalEntryId);
            JournalEntryResponse response = journalEntryService.reverse(journalEntryId, username);

            return PostingResult.builder()
                    .success(true)
                    .journalEntryId(response.getJournalEntryId())
                    .entryNumber(response.getEntryNumber())
                    .message("Journal entry reversed successfully")
                    .build();

        } catch (Exception e) {
            log.error("Failed to reverse journal entry ID: {}", journalEntryId, e);
            return PostingResult.builder()
                    .success(false)
                    .message("Failed to reverse GL entry: " + e.getMessage())
                    .build();
        }
    }
}
