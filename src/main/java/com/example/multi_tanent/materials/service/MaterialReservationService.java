package com.example.multi_tanent.materials.service;

import com.example.multi_tanent.materials.dto.MaterialReservationRequest;
import com.example.multi_tanent.materials.dto.MaterialReservationResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MaterialReservationService {
    MaterialReservationResponse create(MaterialReservationRequest request, HttpServletRequest httpRequest);

    MaterialReservationResponse update(Long id, MaterialReservationRequest request,
            HttpServletRequest httpRequest);

    MaterialReservationResponse getById(Long id, HttpServletRequest httpRequest);

    Page<MaterialReservationResponse> getAll(Pageable pageable, HttpServletRequest httpRequest);

    void delete(Long id, HttpServletRequest httpRequest);
}
