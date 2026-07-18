package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResultDto {
    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<RowError> errors;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RowError {
        private int row;
        private String leadNo;
        private String reason;
    }
}
