package com.example.multi_tanent.production.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Shift {
    DAY_SHIFT("Day Shift"),
    NIGHT_SHIFT("Night Shift");

    private final String label;

    Shift(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static Shift fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim().toUpperCase();
        if (normalized.equals("DAY") || normalized.equals("DAY SHIFT") || normalized.equals("DAY_SHIFT")) {
            return DAY_SHIFT;
        }
        if (normalized.equals("NIGHT") || normalized.equals("NIGHT SHIFT") || normalized.equals("NIGHT_SHIFT")) {
            return NIGHT_SHIFT;
        }
        throw new IllegalArgumentException("Unknown Shift: " + value);
    }
}
