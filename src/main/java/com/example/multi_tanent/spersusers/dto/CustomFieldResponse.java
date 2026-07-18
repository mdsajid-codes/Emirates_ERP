package com.example.multi_tanent.spersusers.dto;

import com.example.multi_tanent.spersusers.enitity.CustomField;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomFieldResponse {
    private Long id;
    private Long partyId;
    private String fieldName;
    private String fieldValue;

    public static CustomFieldResponse fromEntity(CustomField entity) {
        return CustomFieldResponse.builder()
                .id(entity.getId())
                .partyId(entity.getParty() != null ? entity.getParty().getId() : null)
                .fieldName(entity.getFieldName())
                .fieldValue(entity.getFieldValue())
                .build();
    }
}