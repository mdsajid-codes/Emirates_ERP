package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsClientSubmissionFormatRequest {
    private String mailingSubject;
    private String body;
    
    @Builder.Default
    private List<String> excelFields = new ArrayList<>();
}
