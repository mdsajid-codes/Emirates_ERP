package com.example.multi_tanent.hanger.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum BatchStage {
    WIRE_CUTTING("Wire Cutting"),
    BENDING("Bending"),
    COATING("Coating"),
    QC("Quality Control"),
    SCRAP("Scrap Logs"),
    PACKING("Packing"),
    DONE("Finished");

    private final String label;

    BatchStage(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static BatchStage fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        for (BatchStage stage : BatchStage.values()) {
            if (stage.name().equals(normalized) || stage.label.equalsIgnoreCase(value)) {
                return stage;
            }
        }
        throw new IllegalArgumentException("Unknown BatchStage: " + value);
    }

    public BatchStage next() {
        return switch (this) {
            case WIRE_CUTTING -> BENDING;
            case BENDING -> COATING;
            case COATING -> QC;
            case QC -> SCRAP;
            case SCRAP -> PACKING;
            case PACKING -> DONE;
            case DONE -> null;
        };
    }

    public BatchStage previous() {
        return switch (this) {
            case WIRE_CUTTING -> WIRE_CUTTING;
            case BENDING -> WIRE_CUTTING;
            case COATING -> BENDING;
            case QC -> COATING;
            case SCRAP -> QC;
            case PACKING -> SCRAP;
            case DONE -> PACKING;
        };
    }
}
