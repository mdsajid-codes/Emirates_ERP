package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsClientSubmissionFormatResponse {
    private Long id;
    private Long clientId;
    private String mailingSubject;
    private String body;
    
    @Builder.Default
    private List<String> excelFields = new ArrayList<>();
    
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
