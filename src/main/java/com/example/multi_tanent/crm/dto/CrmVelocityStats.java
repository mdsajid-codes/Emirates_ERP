package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmVelocityStats {
    private double avgDealSize;
    private long salesCycleDays;
    private long dealsClosed;
    private String message;
}
