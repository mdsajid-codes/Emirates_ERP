package com.example.multi_tanent.accounts.service.journal;

import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryResponse;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus;

import java.time.LocalDate;
import java.util.List;

public interface JournalEntryService {
    JournalEntryResponse createDraft(JournalEntryRequest request, String createdBy);
    JournalEntryResponse updateDraft(Long id, JournalEntryRequest request, String updatedBy);
    JournalEntryResponse post(Long id, String postedBy);
    JournalEntryResponse reverse(Long id, String reversedBy);
    JournalEntryResponse getById(Long id);
    List<JournalEntryResponse> getAll(JournalEntryStatus status, DocumentType documentType, LocalDate from, LocalDate to);
    List<JournalEntryResponse> getByStatus(JournalEntryStatus status);
    List<JournalEntryResponse> getByDateRange(LocalDate from, LocalDate to);
    List<JournalEntryResponse> getByDocumentType(DocumentType docType);
    void delete(Long id);
}
