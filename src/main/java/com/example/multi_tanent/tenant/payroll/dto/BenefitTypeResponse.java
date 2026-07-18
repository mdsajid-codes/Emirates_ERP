package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.BenefitType;
import com.example.multi_tanent.tenant.payroll.enums.CalculationType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BenefitTypeResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Boolean isActive;
    private CalculationType calculationType;
    private BigDecimal valueForAccrual;

    public static BenefitTypeResponse fromEntity(BenefitType entity) {
        if (entity == null) {
            return null;
        }
        BenefitTypeResponse dto = new BenefitTypeResponse();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setIsActive(entity.getIsActive());
        dto.setCalculationType(entity.getCalculationType());
        dto.setValueForAccrual(entity.getValueForAccrual());
        return dto;
    }
}