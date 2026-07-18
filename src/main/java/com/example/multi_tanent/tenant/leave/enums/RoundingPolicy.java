package com.example.multi_tanent.tenant.leave.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum RoundingPolicy {
    NO_ROUNDING,
    NEAREST_HALF_DAY,
    NEAREST_FULL_DAY,
    ROUND_UP_TO_NEXT_HALF_DAY,
    ROUND_UP_TO_NEXT_FULL_DAY,
    ROUND_DOWN_TO_PREVIOUS_HALF_DAY,
    ROUND_DOWN_TO_PREVIOUS_FULL_DAY;

    @JsonCreator
    public static RoundingPolicy fromString(String value) {
        if (value == null) {
            return null;
        }
        // Add aliases for common, simpler names
        return switch (value.toUpperCase()) {
            case "ROUND_UP" -> ROUND_UP_TO_NEXT_HALF_DAY;
            case "NONE" -> NO_ROUNDING;
            default -> {
                yield RoundingPolicy.valueOf(value.toUpperCase());
            }
        };
    }
}