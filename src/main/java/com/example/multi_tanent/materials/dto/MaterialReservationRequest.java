package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.enums.ReserveStatus;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class MaterialReservationRequest {
    private LocalDate reservationDate;
    private Long materialRequisitionId;
    private ReserveStatus status;
    private String remarks;
    private List<MaterialReservationDetailRequest> details;
}
