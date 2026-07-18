package com.example.multi_tanent.accounts.repository.journal;

import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    @Query("SELECT j FROM JournalEntry j WHERE j.entryNumber = :entryNumber AND j.tenantId = :tenantId")
    Optional<JournalEntry> findByEntryNumberAndTenant(@Param("entryNumber") String entryNumber, @Param("tenantId") Long tenantId);

    @Query("SELECT j FROM JournalEntry j WHERE j.status = :status AND j.tenantId = :tenantId")
    List<JournalEntry> findByStatusAndTenant(@Param("status") JournalEntryStatus status, @Param("tenantId") Long tenantId);

    @Query("SELECT j FROM JournalEntry j WHERE j.entryDate BETWEEN :from AND :to AND j.tenantId = :tenantId")
    List<JournalEntry> findByEntryDateBetweenAndTenant(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("tenantId") Long tenantId);

    @Query("SELECT j FROM JournalEntry j WHERE j.documentType = :documentType AND j.tenantId = :tenantId")
    List<JournalEntry> findByDocumentTypeAndTenant(@Param("documentType") DocumentType documentType, @Param("tenantId") Long tenantId);

    @Query("SELECT COUNT(j) FROM JournalEntry j WHERE j.status = :status AND j.tenantId = :tenantId")
    long countByStatusAndTenant(@Param("status") JournalEntryStatus status, @Param("tenantId") Long tenantId);

    @Query("SELECT j FROM JournalEntry j WHERE j.tenantId = :tenantId")
    List<JournalEntry> findAllByTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(MAX(j.journalEntryId), 0) FROM JournalEntry j WHERE j.entryNumber LIKE :prefix AND j.tenantId = :tenantId")
    long findMaxIdForYearPrefix(@Param("prefix") String prefix, @Param("tenantId") Long tenantId);

    @Query("SELECT j FROM JournalEntry j WHERE j.referenceId = :referenceId AND j.tenantId = :tenantId")
    List<JournalEntry> findByReferenceIdAndTenant(@Param("referenceId") Long referenceId, @Param("tenantId") Long tenantId);
}
