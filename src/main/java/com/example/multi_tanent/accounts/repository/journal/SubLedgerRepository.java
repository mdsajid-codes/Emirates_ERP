package com.example.multi_tanent.accounts.repository.journal;

import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface SubLedgerRepository extends JpaRepository<JournalEntryLine, Long> {

    @Query("SELECT jel.dimCompanyId AS partyId, " +
           "SUM(jel.debitAmount) AS totalDebit, " +
           "SUM(jel.creditAmount) AS totalCredit, " +
           "SUM(jel.debitAmount) - SUM(jel.creditAmount) AS balance " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimCompanyId IS NOT NULL " +
           "GROUP BY jel.dimCompanyId")
    List<Object[]> getPartyBalances(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimCompanyId IS NOT NULL")
    List<Object[]> getLinesWithDueDate(@Param("tenantId") Long tenantId,
                                       @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimCompanyId = :partyId " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getPartyStatementRows(@Param("tenantId") Long tenantId, 
                                         @Param("accountIds") List<Long> accountIds, 
                                         @Param("partyId") Long partyId);

    @Query("SELECT SUM(jel.debitAmount), SUM(jel.creditAmount) " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimCompanyId = :partyId " +
           "AND je.entryDate < :before")
    Object[] getPartyOpeningBalance(@Param("tenantId") Long tenantId,
                                    @Param("accountIds") List<Long> accountIds,
                                    @Param("partyId") Long partyId,
                                    @Param("before") LocalDate before);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimCompanyId = :partyId " +
           "AND (:from IS NULL OR je.entryDate >= :from) " +
           "AND (:to IS NULL OR je.entryDate <= :to) " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getPartyStatementRowsFiltered(@Param("tenantId") Long tenantId,
                                                 @Param("accountIds") List<Long> accountIds,
                                                 @Param("partyId") Long partyId,
                                                 @Param("from") LocalDate from,
                                                 @Param("to") LocalDate to);

    @Query("SELECT jel.dimCompanyId FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimCompanyId IS NOT NULL " +
           "GROUP BY jel.dimCompanyId")
    List<Long> getPartiesWithBalances(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel.dimEmployeeId AS employeeId, " +
           "SUM(jel.debitAmount) AS totalDebit, " +
           "SUM(jel.creditAmount) AS totalCredit, " +
           "SUM(jel.debitAmount) - SUM(jel.creditAmount) AS balance " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimEmployeeId IS NOT NULL " +
           "GROUP BY jel.dimEmployeeId")
    List<Object[]> getEmployeeBalances(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimEmployeeId = :employeeId " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getEmployeeStatementRows(@Param("tenantId") Long tenantId, 
                                            @Param("accountIds") List<Long> accountIds, 
                                            @Param("employeeId") Long employeeId);

    @Query("SELECT jel.dimBankAccountId AS bankAccountId, " +
           "SUM(jel.debitAmount) AS totalDebit, " +
           "SUM(jel.creditAmount) AS totalCredit, " +
           "SUM(jel.debitAmount) - SUM(jel.creditAmount) AS balance " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimBankAccountId IS NOT NULL " +
           "GROUP BY jel.dimBankAccountId")
    List<Object[]> getBankBalances(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimBankAccountId = :bankAccountId " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getBankStatementRows(@Param("tenantId") Long tenantId, 
                                        @Param("accountIds") List<Long> accountIds, 
                                        @Param("bankAccountId") Long bankAccountId);

    @Query("SELECT jel.dimItemId AS itemId, " +
           "SUM(CASE WHEN jel.debitAmount > 0 THEN jel.quantity ELSE 0.0 END) AS totalQtyIn, " +
           "SUM(CASE WHEN jel.creditAmount > 0 THEN jel.quantity ELSE 0.0 END) AS totalQtyOut, " +
           "SUM(jel.debitAmount) AS totalDebit, " +
           "SUM(jel.creditAmount) AS totalCredit " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimItemId IS NOT NULL " +
           "GROUP BY jel.dimItemId")
    List<Object[]> getInventoryItemBalances(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimItemId = :itemId " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getInventoryMovementRows(@Param("tenantId") Long tenantId, 
                                            @Param("accountIds") List<Long> accountIds, 
                                            @Param("itemId") Long itemId);

    @Query("SELECT jel.dimItemId AS assetId, " +
           "SUM(jel.debitAmount) AS totalDebit, " +
           "SUM(jel.creditAmount) AS totalCredit " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimItemId IS NOT NULL " +
           "GROUP BY jel.dimItemId")
    List<Object[]> getAssetBalances(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimItemId = :fixedAssetId " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getAssetMovementRows(@Param("tenantId") Long tenantId, 
                                        @Param("accountIds") List<Long> accountIds, 
                                        @Param("fixedAssetId") Long fixedAssetId);

    @Query("SELECT SUM(jel.debitAmount) - SUM(jel.creditAmount) " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds")
    java.math.BigDecimal getGLAccountBalance(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimCompanyId IS NULL " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getUntaggedPartyLines(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimEmployeeId IS NULL " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getUntaggedEmployeeLines(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimBankAccountId IS NULL " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getUntaggedBankLines(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);

    @Query("SELECT jel, je " +
           "FROM JournalEntryLine jel " +
           "JOIN jel.journalEntry je " +
           "WHERE je.status = 'POSTED' " +
           "AND je.tenantId = :tenantId " +
           "AND jel.account.accountId IN :accountIds " +
           "AND jel.dimItemId IS NULL " +
           "ORDER BY je.entryDate ASC, je.journalEntryId ASC")
    List<Object[]> getUntaggedItemLines(@Param("tenantId") Long tenantId, @Param("accountIds") List<Long> accountIds);
}

