package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTodoLabelRequest {
    @NotBlank
    private String name;
    private String colorHex;   // optional like "FFFFFF" or "#FFFFFF"
    private boolean starred;
}

