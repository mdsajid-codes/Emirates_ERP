package com.example.multi_tanent.accounts.dto.subledger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedAssetRegisterRow {
    private Long fixedAssetId;
    private String assetNumber;
    private String description;
    private LocalDate acquisitionDate;
    private BigDecimal cost;
    private BigDecimal accumDepreciation;
    private BigDecimal netBookValue;
    private String status;
}
