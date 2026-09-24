package com.example.multi_tanent.accounts.entity.enums;

public enum AccountSection {

    // ─── BALANCE SHEET — CURRENT ASSETS ──────────────────────────────────
    BS_CASH,                          // Cash on Hand + Bank accounts (liquid cash)
    BS_CASH_EQUIVALENTS,              // Short-term investments <3 months
    BS_CURRENT_FINANCIAL_ASSETS,      // Short-term loans given, financial instruments
    BS_INVENTORIES,                   // Goods, Raw Materials, WIP, Packaging
    BS_TRADE_RECEIVABLES,             // Customer balances (money owed TO company)
    BS_INPUT_VAT,                     // Recoverable VAT (5% on purchases)
    BS_PREPAYMENTS_TO_SUPPLIERS,      // Advances paid to suppliers
    BS_PDC_RECEIVED,                  // Post-dated cheques received from customers
    BS_DEFERRED_EXPENSES,             // Prepaid costs < 1 year (current portion)
    BS_CONTRACT_ASSETS,               // Unbilled revenue (work done, invoice not raised)

    // ─── BALANCE SHEET — NON-CURRENT ASSETS ──────────────────────────────
    BS_FIXED_ASSETS,                  // PPE at cost (Buildings, Machinery, Vehicles)
    BS_CAPITAL_IMPROVEMENTS_PPE,      // Capital improvements to Fixed Assets
    BS_INTANGIBLE_ASSETS,             // Software licenses, patents, goodwill
    BS_INVESTMENT_PROPERTY,           // Properties held for rental/appreciation
    BS_ACCUMULATED_DEPRECIATION,      // Contra-asset (reduces Fixed Asset net value)
    BS_NON_CURRENT_FINANCIAL_ASSETS,  // Long-term investments/loans given
    BS_NON_CURRENT_DEFERRED_EXPENSES, // Prepaid costs > 1 year
    BS_NON_CURRENT_CONTRACT_ASSETS,   // Long-term unbilled revenue
    BS_DEFERRED_TAX_ASSETS,           // Future tax benefits

    // ─── BALANCE SHEET — CURRENT LIABILITIES ──────────────────────────────
    BS_TRADE_PAYABLES,                // Supplier balances (money owed BY company)
    BS_ADVANCES_FROM_CUSTOMERS,       // Prepayments received from customers
    BS_PDC_ISSUED,                    // Post-dated cheques issued to suppliers
    BS_DEFERRED_REVENUE,              // Revenue collected but not yet earned (< 1yr)
    BS_VAT_PAYABLE,                   // Output VAT owed to FTA (5% on sales)
    BS_SALARIES_PAYABLE,              // Accrued payroll owed to employees
    BS_EOSB_PROVISION,                // End of Service Benefit provision (UAE)
    BS_CURRENT_FINANCIAL_LIABILITIES, // Short-term bank loans, overdrafts
    BS_CURRENT_INCOME_TAX_PAYABLE,    // Corporate income tax owed for current period
    BS_CURRENT_OTHER_TAX_PAYABLE,     // Other taxes (municipal, etc.)
    BS_CONTRACT_LIABILITIES,          // Obligations to customers (IFRS 15)

    // ─── BALANCE SHEET — NON-CURRENT LIABILITIES ─────────────────────────
    BS_NON_CURRENT_FINANCIAL_LIABILITIES, // Long-term loans > 1 year
    BS_DEFERRED_TAX_LIABILITIES,          // Future tax obligations
    BS_NON_CURRENT_DEFERRED_REVENUE,      // Revenue deferred > 1 year
    BS_NON_CURRENT_CONTRACT_LIABILITIES,  // Long-term obligations to customers

    // ─── BALANCE SHEET — EQUITY ───────────────────────────────────────────
    BS_SHARE_CAPITAL,                 // Issued share capital / owner's investment
    BS_RETAINED_EARNINGS,             // Accumulated profits not distributed
    BS_EQUITY,                        // Other equity components (share premium, etc.)
    BS_NON_CONTROLLING_INTEREST,      // Minority shareholders' equity

    // ─── INCOME STATEMENT — REVENUE ───────────────────────────────────────
    PL_SALES_GOODS,                   // Revenue from selling physical products
    PL_SALES_SERVICES,                // Revenue from delivering services
    PL_OTHER_INCOME,                  // Misc income (inventory gains, insurance, etc.)
    PL_TRADE_DISCOUNTS,               // Contra-revenue: discounts given to customers

    // ─── INCOME STATEMENT — COST OF SALES ────────────────────────────────
    PL_COS_GOODS,                     // COGS: cost of inventory sold
    PL_COS_PRODUCTION,                // Cost of production (WIP to Finished Goods)

    // ─── INCOME STATEMENT — OPERATING EXPENSES ───────────────────────────
    PL_ADMIN_EXPENSES,                // Office overhead: utilities, rent, stationery
    PL_OPERATING_EXPENSES,            // Operational costs: write-offs, adjustments
    PL_DEPRECIATION,                  // Fixed asset depreciation (non-cash)
    PL_SALARIES,                      // Employee salaries and allowances
    PL_EOSB,                          // End of Service Benefit expense
    PL_FUEL_TRANSPORT,                // Fleet: fuel and transport costs
    PL_PRODUCTION_OVERHEADS,          // Manufacturing overhead costs

    // ─── INCOME STATEMENT — FINANCE INCOME/COSTS ─────────────────────────
    PL_INTEREST_INCOME,               // Income from investments / deposits
    PL_INTEREST_EXPENSE,              // Bank loan interest / finance costs

    // ─── INCOME STATEMENT — TAX ───────────────────────────────────────────
    PL_INCOME_TAX,                    // Corporate income tax expense

    // ─── POS-SPECIFIC ─────────────────────────────────────────────────────
    BS_POS_CARD_CLEARING,             // Bridge: card tender, clears to zero after acquirer settlement
    PL_POS_BANK_CHARGES,              // Merchant/acquirer processing fees (not COGS)
    PL_POS_CASH_VARIANCE,             // Cash over/short at shift close (not COGS)
    PL_POS_RETURNS,                   // Contra-revenue: POS sales returns/refunds
    PL_POS_COGS,                      // POS COGS expense

    // ─── SPECIAL ──────────────────────────────────────────────────────────
    ACCOUNTS_GROUP,                   // Parent/group nodes (not postable accounts)
    OFF_BALANCE                       // Off-balance sheet accounts (contingencies)
}
