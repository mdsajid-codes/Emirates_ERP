package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.MyCustomField;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyCustomFieldResponse {
    private Long id;
    private String fieldName;
    private String fieldValue;
    private String fieldType;
    private String documentName;
    private String documentUrl;

    public static MyCustomFieldResponse fromEntity(MyCustomField entity) {
        return MyCustomFieldResponse.builder()
                .id(entity.getId())
                .fieldName(entity.getFieldName())
                .fieldValue(entity.getFieldValue())
                .fieldType(entity.getFieldType())
                .documentName(entity.getDocumentName())
                .documentUrl(entity.getDocumentUrl())
                .build();
    }
}
