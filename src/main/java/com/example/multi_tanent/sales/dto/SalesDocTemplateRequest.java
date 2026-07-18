package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.SalesDocType;
import lombok.Data;

@Data
public class SalesDocTemplateRequest {
    private String name;
    private SalesDocType docType;
    private String templateContent;
    private boolean isDefault;
}
