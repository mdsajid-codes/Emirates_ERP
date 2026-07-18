package com.example.multi_tanent.materials.service;

import com.example.multi_tanent.materials.dto.MaterialRequisionResponse;
import com.example.multi_tanent.materials.enums.IndentStatus;
import com.example.multi_tanent.materials.enums.MaterialRequisitionStatus;
import com.example.multi_tanent.materials.enums.ReserveStatus;
import com.example.multi_tanent.production.entity.ManufacturingOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface MaterialRequisionService {
    void createRequisitionFromMO(ManufacturingOrder mo);

    Page<MaterialRequisionResponse> getAll(Pageable pageable, String search, LocalDate fromDate, LocalDate toDate);

    MaterialRequisionResponse getById(Long id);

    MaterialRequisionResponse getByManufacturingOrderId(Long moId);

    MaterialRequisionResponse updateStatus(Long id, MaterialRequisitionStatus status);

    MaterialRequisionResponse updateMaterialStatus(Long id,
            com.example.multi_tanent.materials.enums.MaterialStatus status);

    MaterialRequisionResponse updateIndentStatus(Long id, IndentStatus status);

    MaterialRequisionResponse updateReserveStatus(Long id, ReserveStatus status);

    void generateMissingRequisitions();
}
