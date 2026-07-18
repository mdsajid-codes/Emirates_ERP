package com.example.multi_tanent.accounts.repository.journal;

import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryLineRepository extends JpaRepository<JournalEntryLine, Long> {

    @Query("SELECT l FROM JournalEntryLine l WHERE l.journalEntry.journalEntryId = :entryId")
    List<JournalEntryLine> findByJournalEntryId(@Param("entryId") Long entryId);

    @Query("SELECT l FROM JournalEntryLine l WHERE l.account.accountId = :accountId")
    List<JournalEntryLine> findByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT COUNT(l) > 0 FROM JournalEntryLine l WHERE l.account.accountId = :accountId AND l.journalEntry.status = com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus.POSTED")
    boolean existsPostedLinesByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT COUNT(l) > 0 FROM JournalEntryLine l WHERE l.account.accountId = :accountId")
    boolean existsAnyLinesByAccountId(@Param("accountId") Long accountId);

    @Query("SELECT l, l.journalEntry FROM JournalEntryLine l WHERE l.journalEntry.status = com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus.POSTED AND l.journalEntry.tenantId = :tenantId AND (:toDate IS NULL OR l.journalEntry.entryDate <= :toDate)")
    List<Object[]> findPostedLinesUpToDate(@Param("tenantId") Long tenantId, @Param("toDate") java.time.LocalDate toDate);

    @Query("SELECT l FROM JournalEntryLine l JOIN FETCH l.journalEntry WHERE l.account.accountId = :accountId AND l.journalEntry.status = com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus.POSTED AND l.journalEntry.tenantId = :tenantId AND (:toDate IS NULL OR l.journalEntry.entryDate <= :toDate) ORDER BY l.journalEntry.entryDate ASC, l.journalEntry.journalEntryId ASC, l.lineNumber ASC")
    List<JournalEntryLine> findPostedLinesByAccountUpToDate(@Param("accountId") Long accountId, @Param("tenantId") Long tenantId, @Param("toDate") java.time.LocalDate toDate);

    @Query("SELECT l FROM JournalEntryLine l JOIN FETCH l.journalEntry je " +
           "WHERE l.account.accountId = :accountId AND je.status = com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus.POSTED " +
           "AND je.journalEntryId NOT IN (SELECT bsl.linkedJournal.journalEntryId FROM AccBankStatementLine bsl WHERE bsl.linkedJournal IS NOT NULL)")
    List<JournalEntryLine> findUnreconciledLinesByAccountId(@Param("accountId") Long accountId);
}
