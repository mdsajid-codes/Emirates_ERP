package com.example.multi_tanent.accounts.entity.enums;

public enum AccountBalanceType {
    DEBIT,         // Assets, Expenses — increases with Dr, decreases with Cr
    CREDIT,        // Liabilities, Equity, Income — increases with Cr, decreases with Dr
    DEBIT_CREDIT   // Clearing / contra accounts — can swing either way
}
