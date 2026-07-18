package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.BankReconciliationDto;
import java.util.List;

public interface BankReconciliationService {
    BankReconciliationDto createReconciliation(BankReconciliationDto dto, Long tenantId);
    BankReconciliationDto getReconciliation(Long id, Long tenantId);
    List<BankReconciliationDto> getReconciliationsByBank(Long bankAccountId, Long tenantId);
    BankReconciliationDto updateMatchStatus(Long matchId, Boolean isCleared, Long tenantId);
    BankReconciliationDto completeReconciliation(Long id, Long tenantId);
}
