package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.entity.LeadSource;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeadSourceResponse {
    private Long id;
    private String name;

    public static LeadSourceResponse fromEntity(LeadSource entity) {
        return LeadSourceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }
}