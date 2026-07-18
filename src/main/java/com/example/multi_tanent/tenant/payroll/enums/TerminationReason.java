package com.example.multi_tanent.tenant.payroll.enums;

public enum TerminationReason {
    RESIGNATION, // Employee initiated
    TERMINATION, // Employer initiated
    CONTRACT_END, // For limited contracts
    TERMINATION_FOR_CAUSE // As per Article 44 (new law) / 120 (old law)
}