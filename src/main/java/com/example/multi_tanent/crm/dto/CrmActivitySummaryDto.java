package com.example.multi_tanent.crm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmActivitySummaryDto {
    private String employeeName;
    private Long calls;
    private Long tasks;
    private Long emailsSent;
}
