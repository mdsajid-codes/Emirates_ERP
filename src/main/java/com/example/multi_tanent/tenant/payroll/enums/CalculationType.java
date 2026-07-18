package com.example.multi_tanent.tenant.payroll.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CalculationType {
    PERCENTAGE_OF_GROSS,
    FORMULA_BASED,
    PERCENTAGE_OF_BASIC,
    FLAT_AMOUNT;

    /**
     * Custom deserializer to allow for more flexible string matching.
     * This allows "FLAT" to be used as an alias for "FLAT_AMOUNT".
     * @param key The input string from the JSON payload.
     * @return The matching CalculationType enum constant.
     */
    @JsonCreator
    public static CalculationType fromString(String key) {
        if (key != null && key.equalsIgnoreCase("FLAT")) {
            return FLAT_AMOUNT;
        }
        // Fallback to default case-insensitive matching for other values
        return CalculationType.valueOf(key.toUpperCase());
    }
}