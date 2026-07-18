package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyTypeDto {
    private Long id;
    private String name;
    private Long locationId;
    private String locationName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}