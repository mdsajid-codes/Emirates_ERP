package com.example.multi_tanent.hanger.enums;

public enum ScrapReasonCode {
    FLASH, // Excess material at mold edges
    SHORT_SHOT, // Incomplete molding fill
    COLOR_BLEED, // Color inconsistency
    HOOK_TENSION, // Hook fails pull/tension test
    WEIGHT_FAIL, // Exceeds/below weight spec
    SURFACE_SCRATCH, // Surface damage
    WARPING, // Dimensional distortion
    OTHER // Catch-all with free text in remarks
}
