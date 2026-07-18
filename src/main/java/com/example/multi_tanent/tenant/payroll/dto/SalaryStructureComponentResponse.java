package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.SalaryStructureComponent;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalaryStructureComponentResponse {
    private Long id;
    private String componentName;
    private String componentCode;
    private BigDecimal value;
    private String formula;

    public static SalaryStructureComponentResponse fromEntity(SalaryStructureComponent component) {
        SalaryStructureComponentResponse dto = new SalaryStructureComponentResponse();
        dto.setId(component.getId());
        dto.setComponentName(component.getSalaryComponent().getName());
        dto.setComponentCode(component.getSalaryComponent().getCode());
        dto.setValue(component.getValue());
        dto.setFormula(component.getFormula());
        return dto;
    }
}