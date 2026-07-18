package com.example.multi_tanent.accounts.dto.coa;

import com.example.multi_tanent.accounts.entity.enums.PartyType;
import lombok.Data;

@Data
public class PartyGLAccountRequest {
    private Long id; // optional, for editing
    private PartyType partyType;
    private Long partyId;
    
    private Long accountsReceivableId;
    private Long accountsPayableId;
    private Long advancesReceivedId;
    private Long advancesPaidId;
    private Long pdcsReceivedId;
    private Long pdcsIssuedId;
    private Long contractAssetsId;
    private Long retentionReceivablesId;
    private Long retentionPayablesId;
    private Long retentionOutputVatId;
    private Long retentionInputVatId;
    private Long unbilledPurchasesId;
    private Long advanceToReceiveId;
}
