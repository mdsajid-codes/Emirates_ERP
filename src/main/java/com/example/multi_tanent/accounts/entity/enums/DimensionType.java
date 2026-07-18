package com.example.multi_tanent.accounts.entity.enums;

public enum DimensionType {
    ITEM,                    // Break down by product/SKU
    WAREHOUSE,               // Break down by storage location
    FIXED_ASSET,             // Track per physical asset
    EMPLOYEE,                // Break down by staff member
    TAX_TYPE,                // Separate VAT types in one account
    COMPANY,                 // Track per business entity (customer/supplier)
    CONTRACT,                // Break down by project/contract
    BUSINESS_ACTIVITY,       // By line of business
    CASH_FLOW_ITEM,          // Tag transactions for Cash Flow Statement
    EXPENSE_ITEM,            // Expense category breakdown
    INCOME_ITEM,             // Income category breakdown
    BANK_ACCOUNT,            // Track per bank account
    DEFERRED_EXPENSE,        // Per deferral expense schedule
    DEFERRED_REVENUE,        // Per revenue recognition schedule
    EQUITY_MOVEMENTS_ITEMS,  // Per equity change type
    INVESTMENT_PROPERTY,     // Per investment property
    BASIS,                   // Basis of allocation
    TYPES_OF_PAYMENTS,       // Payment method categorization
    COST_OBJECT,             // Cost center / cost object
    INPUT_VAT_TYPES,         // Input VAT type breakdown
    CASH_EQUIVALENT,         // Per cash equivalent instrument
    PREPAYMENTS_DOCUMENT     // Per prepayment document reference
}
