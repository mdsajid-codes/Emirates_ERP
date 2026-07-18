package com.example.multi_tanent.accounts.service.subledger;

import com.example.multi_tanent.accounts.dto.subledger.AssetMovementRow;
import com.example.multi_tanent.accounts.dto.subledger.FixedAssetRegisterRow;

import java.util.List;

public interface FixedAssetSubLedgerService {
    List<FixedAssetRegisterRow> getFixedAssetRegister(Long tenantId);
    List<AssetMovementRow> getAssetMovement(Long fixedAssetId, Long tenantId);
}
