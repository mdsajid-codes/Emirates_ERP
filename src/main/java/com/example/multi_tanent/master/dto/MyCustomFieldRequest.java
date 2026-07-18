package com.example.multi_tanent.master.dto;

import lombok.Data;

@Data
public class MyCustomFieldRequest {
    private String fieldName;
    private String fieldValue;
    private String fieldType;
    private String documentName;
    // Note: documentUrl handling will be done via separate file upload logic if
    // needed,
    // or as part of the overall multipart request in the parent DTO.
    // For now, assuming basic text fields here.
}
