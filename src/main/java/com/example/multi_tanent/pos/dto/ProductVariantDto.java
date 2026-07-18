package com.example.multi_tanent.pos.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantDto {
    private Long id;
    private String sku;
    private String barcode;
    private JsonNode attributes;
    private long priceCents;
    private long costCents;
    private String imageUrl;
    private String barcodeImageUrl;
    private boolean active;
    private Long taxRateId;
    private String taxRateName;
    private BigDecimal taxRatePercent;
}