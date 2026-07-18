package com.example.multi_tanent.crm.dto;


import jakarta.validation.constraints.NotBlank; 
import lombok.AllArgsConstructor; 
import lombok.Getter; 
import lombok.NoArgsConstructor; 
import lombok.Setter; 

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CrmIndustryRequest {
  @NotBlank(message = "Industry name is required")
  private String name;

  private Long locationId; // Optional
}
