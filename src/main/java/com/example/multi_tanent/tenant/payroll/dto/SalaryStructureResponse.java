package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.SalaryStructure;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class SalaryStructureResponse {
    private Long id;
    private String structureName;
    private LocalDate effectiveDate;
    private List<ComponentResponse> components;

    @Data
    private static class ComponentResponse {
        private Long id;
        private String componentCode;
        private String componentName;
        private BigDecimal value;
        private String formula;
    }

    public static SalaryStructureResponse fromEntity(SalaryStructure structure) {
        if (structure == null) {
            return null;
        }
        SalaryStructureResponse dto = new SalaryStructureResponse();
        dto.setId(structure.getId());
        dto.setStructureName(structure.getStructureName());
        dto.setEffectiveDate(structure.getEffectiveDate());
        if (structure.getComponents() != null) {
            dto.setComponents(structure.getComponents().stream().map(ssc -> {
                ComponentResponse compDto = new ComponentResponse();
                compDto.setId(ssc.getId());
                if (ssc.getSalaryComponent() != null) {
                    compDto.setComponentCode(ssc.getSalaryComponent().getCode());
                    compDto.setComponentName(ssc.getSalaryComponent().getName());
                }
                compDto.setValue(ssc.getValue());
                compDto.setFormula(ssc.getFormula());
                return compDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}