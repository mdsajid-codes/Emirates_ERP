package com.example.multi_tanent.accounts.dto.coa;

import com.example.multi_tanent.accounts.entity.enums.PartyType;
import lombok.Data;

@Data
public class PartyGLAccountResponse {
    private Long id;
    private PartyType partyType;
    private Long partyId;

    // Accounts Receivable
    private Long accountsReceivableId;
    private String accountsReceivableCode;
    private String accountsReceivableDescription;

    // Accounts Payable
    private Long accountsPayableId;
    private String accountsPayableCode;
    private String accountsPayableDescription;

    // Advances Received
    private Long advancesReceivedId;
    private String advancesReceivedCode;
    private String advancesReceivedDescription;

    // Advances Paid
    private Long advancesPaidId;
    private String advancesPaidCode;
    private String advancesPaidDescription;

    // PDCs Received
    private Long pdcsReceivedId;
    private String pdcsReceivedCode;
    private String pdcsReceivedDescription;

    // PDCs Issued
    private Long pdcsIssuedId;
    private String pdcsIssuedCode;
    private String pdcsIssuedDescription;

    // Contract Assets
    private Long contractAssetsId;
    private String contractAssetsCode;
    private String contractAssetsDescription;

    // Retention Receivables
    private Long retentionReceivablesId;
    private String retentionReceivablesCode;
    private String retentionReceivablesDescription;

    // Retention Payables
    private Long retentionPayablesId;
    private String retentionPayablesCode;
    private String retentionPayablesDescription;

    // Retention Output VAT
    private Long retentionOutputVatId;
    private String retentionOutputVatCode;
    private String retentionOutputVatDescription;

    // Retention Input VAT
    private Long retentionInputVatId;
    private String retentionInputVatCode;
    private String retentionInputVatDescription;

    // Unbilled Purchases
    private Long unbilledPurchasesId;
    private String unbilledPurchasesCode;
    private String unbilledPurchasesDescription;

    // Advance to Receive
    private Long advanceToReceiveId;
    private String advanceToReceiveCode;
    private String advanceToReceiveDescription;
}
