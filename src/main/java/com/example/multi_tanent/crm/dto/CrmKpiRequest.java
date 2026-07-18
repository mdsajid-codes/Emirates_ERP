package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.KpiType;
import com.example.multi_tanent.crm.enums.KpidataType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrmKpiRequest {
    @NotBlank(message = "KPI name is required.")
    @Size(max = 255)
    private String name;
    private String description;
    @NotNull(message = "Data type is required.")
    private KpidataType dataType;
    @NotNull(message = "KPI type is required.")
    private KpiType type;

    private Long locationId; // Optional

    @Valid
    private Set<CrmKpiEmployeeRequest> assignedEmployees = new HashSet<>();
}