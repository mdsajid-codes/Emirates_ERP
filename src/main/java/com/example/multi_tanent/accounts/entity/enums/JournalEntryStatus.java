package com.example.multi_tanent.accounts.entity.enums;

public enum JournalEntryStatus {
    DRAFT,     // Not yet committed — can be edited or deleted
    POSTED,    // Permanently committed — affects GL balances
    REVERSED   // Has been reversed by a compensating entry
}
