package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmProductResponse {
    private Long id;
    private String name;
    private Long industryId;
    private String industryName;
    private Long locationId;
    private String locationName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
