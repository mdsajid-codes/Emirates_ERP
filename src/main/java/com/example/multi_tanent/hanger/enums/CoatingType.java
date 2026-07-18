package com.example.multi_tanent.hanger.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CoatingType {
    POWDER("Powder Coating"),
    ELECTROPLATE("Electroplating"),
    LACQUER("Lacquer / Dip");

    private final String label;

    CoatingType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static CoatingType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        for (CoatingType type : CoatingType.values()) {
            if (type.name().equals(normalized) || type.label.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown CoatingType: " + value);
    }
}
