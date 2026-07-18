package com.example.multi_tanent.hanger.enums;

public enum CoilInspectionStatus {
    PENDING, // Awaiting QC
    APPROVED, // Passed QC — can be issued to production
    REJECTED // Failed QC — cannot be used
}
