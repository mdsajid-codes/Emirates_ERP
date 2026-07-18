package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadIntakeDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String company;       // Company name as string
    private String source;        // Lead source name
    private String campaign;      // Optional campaign info
    private String requirements;
    private String notes;
    private Map<String, Object> metadata; // Any additional data
}
