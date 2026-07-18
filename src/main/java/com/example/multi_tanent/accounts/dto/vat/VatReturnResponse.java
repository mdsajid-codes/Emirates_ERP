package com.example.multi_tanent.accounts.dto.vat;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
public class VatReturnResponse {
    private LocalDate fromDate;
    private LocalDate toDate;
    
    // FTA Boxes 1 to 14
    private Map<String, BoxData> boxes;
    
    @Data
    public static class BoxData {
        private String description;
        private BigDecimal amount;
        private BigDecimal vatAmount;
    }
}
