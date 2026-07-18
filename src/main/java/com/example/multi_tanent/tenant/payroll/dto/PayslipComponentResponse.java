package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.PayslipComponent;
import com.example.multi_tanent.tenant.payroll.enums.SalaryComponentType;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PayslipComponentResponse {
    private String componentName;
    private String componentCode;
    private SalaryComponentType componentType;
    private BigDecimal amount;

    public static PayslipComponentResponse fromEntity(PayslipComponent component) {
        if (component == null) return null;
        PayslipComponentResponse dto = new PayslipComponentResponse();
        // Assuming SalaryComponent is eagerly fetched or accessible
        dto.setComponentName(component.getSalaryComponent().getName());
        dto.setComponentCode(component.getSalaryComponent().getCode());
        dto.setComponentType(component.getSalaryComponent().getType());
        dto.setAmount(component.getAmount());
        return dto;
    }
}