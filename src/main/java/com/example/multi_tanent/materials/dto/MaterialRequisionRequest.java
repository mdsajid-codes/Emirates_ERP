package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.enums.IndentStatus;
import com.example.multi_tanent.materials.enums.MaterialRequisitionStatus;
import com.example.multi_tanent.materials.enums.RequisitionType;
import com.example.multi_tanent.materials.enums.ReserveStatus;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MaterialRequisionRequest {
    private String requestNo;
    private LocalDate requestDate;
    private Long manufacturingOrderId;
    private Long employeeId;
    private Long locationId;
    private MaterialRequisitionStatus status;
    private IndentStatus indentStatus;
    private ReserveStatus reserveStatus;
    private RequisitionType requisitionFor;
    private Boolean extraRequisition;
    private String remarks;
}
