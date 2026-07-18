package com.example.multi_tanent.crm.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CrmProductDto {
  @NotNull(message = "Industry ID is required")
  private Long industryId;

  @NotBlank(message = "Product name is required")
  private String name;

  private Long locationId; // Optional
}
