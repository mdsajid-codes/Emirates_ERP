package com.example.multi_tanent.crm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmGroupedCountDto {
    private String label;
    private Long count;
}
