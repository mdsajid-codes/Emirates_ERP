package com.example.multi_tanent.hanger.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ScrapType {
    RETURNABLE("Returnable"),
    NON_RETURNABLE("Non-Returnable");

    private final String label;
}
