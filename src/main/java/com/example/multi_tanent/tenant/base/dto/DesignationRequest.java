package com.example.multi_tanent.tenant.base.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DesignationRequest {
    private String title;       // Software Engineer, Manager, HR Executive
    private String level;       // Junior, Mid, Senior, Lead, Director
    private String description;
}
