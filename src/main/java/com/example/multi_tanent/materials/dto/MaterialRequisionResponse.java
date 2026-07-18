package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.entity.MaterialRequision;
import com.example.multi_tanent.materials.enums.IndentStatus;
import com.example.multi_tanent.materials.enums.MaterialRequisitionStatus;
import com.example.multi_tanent.materials.enums.MaterialStatus;
import com.example.multi_tanent.materials.enums.RequisitionType;
import com.example.multi_tanent.materials.enums.ReserveStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class MaterialRequisionResponse {
        private Long id;
        private String requestNo;
        private LocalDate requestDate;
        private String manufacturingOrderNo;
        private Long manufacturingOrderId;
        private String salesOrderNo;
        private String employeeName;
        private String locationName;
        private MaterialRequisitionStatus status;
        private MaterialStatus materialStatus;
        private IndentStatus indentStatus;
        private ReserveStatus reserveStatus;
        private RequisitionType requisitionFor;
        private Boolean extraRequisition;
        private String remarks;
        private String productDetails; // Derived from MO Item
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public static MaterialRequisionResponse fromEntity(MaterialRequision entity) {
                return MaterialRequisionResponse.builder()
                                .id(entity.getId())
                                .requestNo(entity.getRequestNo())
                                .requestDate(entity.getRequestDate())
                                .manufacturingOrderId(
                                                entity.getManufacturingOrder() != null
                                                                ? entity.getManufacturingOrder().getId()
                                                                : null)
                                .manufacturingOrderNo(
                                                entity.getManufacturingOrder() != null
                                                                ? entity.getManufacturingOrder().getMoNumber()
                                                                : null)
                                .salesOrderNo(
                                                entity.getManufacturingOrder() != null && entity.getManufacturingOrder()
                                                                .getSalesOrder() != null
                                                                                ? entity.getManufacturingOrder()
                                                                                                .getSalesOrder()
                                                                                                .getSalesOrderNumber()
                                                                                : null)
                                .employeeName(entity.getEmployee() != null
                                                ? entity.getEmployee().getFirstName() + " "
                                                                + entity.getEmployee().getLastName()
                                                : null)
                                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                                .status(entity.getStatus())
                                .materialStatus(entity.getMaterialStatus())
                                .indentStatus(entity.getIndentStatus())
                                .reserveStatus(entity.getReserveStatus())
                                .requisitionFor(entity.getRequisitionFor())
                                .extraRequisition(entity.getExtraRequisition())
                                .remarks(entity.getRemarks())
                                .productDetails(
                                                entity.getManufacturingOrder() != null
                                                                && entity.getManufacturingOrder().getItem() != null
                                                                                ? entity.getManufacturingOrder()
                                                                                                .getItem().getName()
                                                                                : null)
                                .createdAt(entity.getCreatedAt())
                                .updatedAt(entity.getUpdatedAt())
                                .build();
        }
}
