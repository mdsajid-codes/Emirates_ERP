package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.SalesDocType;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class SalesDocTemplateResponse {
    private Long id;
    private String name;
    private SalesDocType docType;
    private String templateContent;
    private boolean isDefault;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
