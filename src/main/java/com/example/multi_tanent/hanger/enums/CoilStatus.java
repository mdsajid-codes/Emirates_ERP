package com.example.multi_tanent.hanger.enums;

public enum CoilStatus {
    AVAILABLE, // Full stock, not yet issued
    PARTIAL, // Partially issued to production
    EXHAUSTED, // Remaining weight = 0
    QUARANTINE // Failed QC, cannot be issued
}
