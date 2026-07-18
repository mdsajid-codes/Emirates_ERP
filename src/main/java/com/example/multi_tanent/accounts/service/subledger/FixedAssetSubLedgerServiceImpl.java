package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.AssetMovementRow;
import com.example.multi_tanent.accounts.dto.subledger.FixedAssetRegisterRow;
import com.example.multi_tanent.accounts.entity.FixedAssetGLAccount;
import com.example.multi_tanent.accounts.entity.journal.JournalEntry;
import com.example.multi_tanent.accounts.entity.journal.JournalEntryLine;
import com.example.multi_tanent.accounts.repository.FixedAssetGLAccountRepository;
import com.example.multi_tanent.accounts.repository.journal.SubLedgerRepository;
import com.example.multi_tanent.fixedasset.entity.FixedAsset;
import com.example.multi_tanent.fixedasset.repository.FixedAssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(value = "tenantTx", readOnly = true)
public class FixedAssetSubLedgerServiceImpl implements FixedAssetSubLedgerService {

    private final SubLedgerRepository subLedgerRepository;
    private final FixedAssetGLAccountRepository fixedAssetGLAccountRepository;
    private final FixedAssetRepository fixedAssetRepository;

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        return BigDecimal.valueOf(((Number) val).doubleValue());
    }

    @Override
    public List<FixedAssetRegisterRow> getFixedAssetRegister(Long tenantId) {
        List<FixedAssetGLAccount> mappings = fixedAssetGLAccountRepository.findAllByTenant(tenantId);
        if (mappings.isEmpty()) return new ArrayList<>();

        List<Long> costAccountIds = mappings.stream()
                .filter(m -> m.getAssetCostAccount() != null)
                .map(m -> m.getAssetCostAccount().getAccountId())
                .distinct()
                .collect(Collectors.toList());

        List<Long> accumDepAccountIds = mappings.stream()
                .filter(m -> m.getAccumDepreciationAccount() != null)
                .map(m -> m.getAccumDepreciationAccount().getAccountId())
                .distinct()
                .collect(Collectors.toList());

        List<Object[]> costBalances = costAccountIds.isEmpty() ? new ArrayList<>() : subLedgerRepository.getAssetBalances(tenantId, costAccountIds);
        List<Object[]> accumBalances = accumDepAccountIds.isEmpty() ? new ArrayList<>() : subLedgerRepository.getAssetBalances(tenantId, accumDepAccountIds);

        Map<Long, BigDecimal> costMap = costBalances.stream().collect(Collectors.toMap(
                row -> (Long) row[0],
                row -> toBigDecimal(row[1]).subtract(toBigDecimal(row[2])),
                BigDecimal::add
        ));

        Map<Long, BigDecimal> accumMap = accumBalances.stream().collect(Collectors.toMap(
                row -> (Long) row[0],
                row -> toBigDecimal(row[2]).subtract(toBigDecimal(row[1])),
                BigDecimal::add
        ));

        List<FixedAssetRegisterRow> register = new ArrayList<>();
        for (FixedAssetGLAccount mapping : mappings) {
            Long assetId = mapping.getFixedAssetId();
            FixedAsset asset = fixedAssetRepository.findById(assetId).orElse(null);
            if (asset == null) continue;

            BigDecimal cost = costMap.getOrDefault(assetId, BigDecimal.ZERO);
            BigDecimal accumDep = accumMap.getOrDefault(assetId, BigDecimal.ZERO);
            BigDecimal nbv = cost.subtract(accumDep);

            register.add(FixedAssetRegisterRow.builder()
                    .fixedAssetId(assetId)
                    .assetNumber(asset.getAssetNumber())
                    .description(asset.getDescription())
                    .acquisitionDate(asset.getPurchaseDate())
                    .cost(cost)
                    .accumDepreciation(accumDep)
                    .netBookValue(nbv)
                    .status(asset.getAssetStatus() != null ? asset.getAssetStatus().name() : "ACTIVE")
                    .build());
        }

        return register;
    }

    @Override
    public List<AssetMovementRow> getAssetMovement(Long fixedAssetId, Long tenantId) {
        FixedAssetGLAccount mapping = fixedAssetGLAccountRepository.findByFixedAssetIdAndTenantId(fixedAssetId, tenantId).orElse(null);
        if (mapping == null) return new ArrayList<>();

        List<Long> assetAccountIds = new ArrayList<>();
        if (mapping.getAssetCostAccount() != null) assetAccountIds.add(mapping.getAssetCostAccount().getAccountId());
        if (mapping.getAccumDepreciationAccount() != null) assetAccountIds.add(mapping.getAccumDepreciationAccount().getAccountId());

        if (assetAccountIds.isEmpty()) return new ArrayList<>();

        List<Object[]> results = subLedgerRepository.getAssetMovementRows(tenantId, assetAccountIds, fixedAssetId);
        List<AssetMovementRow> movement = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        for (Object[] row : results) {
            JournalEntryLine jel = (JournalEntryLine) row[0];
            JournalEntry je = (JournalEntry) row[1];

            BigDecimal debit = toBigDecimal(jel.getDebitAmount());
            BigDecimal credit = toBigDecimal(jel.getCreditAmount());
            runningBalance = runningBalance.add(debit).subtract(credit);

            movement.add(AssetMovementRow.builder()
                    .journalEntryId(je.getJournalEntryId())
                    .entryNumber(je.getEntryNumber())
                    .entryDate(je.getEntryDate())
                    .documentType(je.getDocumentType().name())
                    .referenceNumber(je.getReferenceNumber())
                    .description(jel.getDescription() != null ? jel.getDescription() : je.getDescription())
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .runningBalance(runningBalance)
                    .build());
        }

        return movement;
    }
}
