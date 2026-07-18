package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.CrmItemType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CrmSalesProductRequest {
    private CrmItemType itemType;
    private Boolean isPurchase;
    private Boolean isSales;
    private String itemCode;
    private String name;
    private String description;
    private String imageUrl;
    private String unitOfMeasure;
    private Integer reorderLimit;
    private String vatClassificationCode;
    private BigDecimal purchasePrice;
    private BigDecimal salesPrice;
    private String tax;
    private Double taxRate;
}
