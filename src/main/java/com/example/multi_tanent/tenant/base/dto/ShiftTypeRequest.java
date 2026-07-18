package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class ShiftTypeRequest {
    private String code;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer breakMinutes;
    private Boolean isNightShift;
}