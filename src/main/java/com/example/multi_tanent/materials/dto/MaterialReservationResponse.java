package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.entity.MaterialReservation;
import com.example.multi_tanent.materials.enums.ReserveStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class MaterialReservationResponse {
    private Long id;
    private String reservationNo;
    private LocalDate reservationDate;
    private Long materialRequisitionId;
    private String materialRequisitionNo;
    private ReserveStatus status;
    private String remarks;
    private List<MaterialReservationDetailResponse> details;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static MaterialReservationResponse fromEntity(MaterialReservation entity) {
        return MaterialReservationResponse.builder()
                .id(entity.getId())
                .reservationNo(entity.getReservationNo())
                .reservationDate(entity.getReservationDate())
                .materialRequisitionId(
                        entity.getMaterialRequisition() != null ? entity.getMaterialRequisition().getId() : null)
                .materialRequisitionNo(
                        entity.getMaterialRequisition() != null ? entity.getMaterialRequisition().getRequestNo() : null)
                .status(entity.getStatus())
                .remarks(entity.getRemarks())
                .details(entity.getDetails() != null ? entity.getDetails().stream()
                        .map(MaterialReservationDetailResponse::fromEntity)
                        .collect(Collectors.toList()) : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
