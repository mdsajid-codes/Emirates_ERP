package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadFilterRequest {
    private String q;          // search term
    private String status;     // e.g. "ACTIVE", "LOST"
    private Long ownerId;
    private String period;     // "TODAY", "WEEK", "MONTH", "YEAR"
}
