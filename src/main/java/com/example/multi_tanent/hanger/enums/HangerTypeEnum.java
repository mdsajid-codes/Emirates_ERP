package com.example.multi_tanent.hanger.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum HangerTypeEnum {
    ADULT("Adult"),
    CHILD("Child"),
    HEAVY_DUTY("Heavy Duty");

    private final String label;

    HangerTypeEnum(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    /**
     * Accept both the enum name (ADULT) and the display label (Adult) from JSON.
     */
    @JsonCreator
    public static HangerTypeEnum fromValue(String value) {
        if (value == null)
            return null;
        for (HangerTypeEnum type : values()) {
            if (type.name().equalsIgnoreCase(value) || type.label.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown HangerTypeEnum value: " + value);
    }
}
