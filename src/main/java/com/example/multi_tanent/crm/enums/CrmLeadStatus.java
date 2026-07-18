package com.example.multi_tanent.crm.enums;

public enum CrmLeadStatus {
    NONE,           // Default status
    NEW,
    DUPLICATE,      // Marked as a duplicate lead
    TRANSFERRED,    // Lead was transferred from another owner
    NOT_RESPONDING, // Marked as not responding
    JUNK,           // Marked as a junk lead
    LOST,
    UNASSIGNED,
    PENDING,
    ACTIVE,
    LEAD_TO_OPERATION
}