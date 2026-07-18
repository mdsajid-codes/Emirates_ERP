package com.example.multi_tanent.tenant.leave.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Defines how holidays and weekends adjacent to a leave period are treated.
 */
public enum SandwichPolicy {
    /** Do not count the adjacent day as leave. */
    DO_NOT_COUNT,

    /** Count the adjacent day as part of the leave. */
    COUNT_AS_LEAVE;

    /**
     * Custom deserializer to allow for more flexible string matching from JSON.
     * This allows older or simpler enum names to be mapped correctly.
     * @param key The input string from the JSON payload.
     * @return The matching SandwichPolicy enum constant.
     */
    @JsonCreator
    public static SandwichPolicy fromString(String key) {
        if (key == null) {
            return null;
        }
        return switch (key.toUpperCase()) {
            case "IGNORE", "DO_NOT_COUNT" -> DO_NOT_COUNT;
            case "SANDWICH_ONLY", "COUNT_AS_LEAVE", "ADJ_EITHER", "ADJ_BEFORE", "ADJ_AFTER" -> COUNT_AS_LEAVE;
            default -> valueOf(key.toUpperCase());
        };
    }
}