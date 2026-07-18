package com.example.multi_tanent.hanger.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ScrapStage {
    WIRE_CUTTING("Wire Cutting"),
    BENDING("Bending"),
    COATING("Coating"),
    QC("Quality Control"),
    PACKING("Packing");

    private final String label;
}
