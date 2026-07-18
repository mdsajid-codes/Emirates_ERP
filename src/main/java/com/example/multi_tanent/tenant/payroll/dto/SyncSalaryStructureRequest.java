package com.example.multi_tanent.tenant.payroll.dto;

import lombok.Data;
import java.util.List;

@Data
public class SyncSalaryStructureRequest {
    private Long structureId;
    private List<String> employeeCodes;
}