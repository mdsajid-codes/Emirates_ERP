package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTodoLabelResponse {
    private Long id;
    private String name;
    private String colorHex;
    private boolean starred;
}
