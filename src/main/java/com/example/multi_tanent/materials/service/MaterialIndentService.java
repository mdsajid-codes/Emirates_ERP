package com.example.multi_tanent.materials.service;

import com.example.multi_tanent.materials.dto.MaterialIndentRequest;
import com.example.multi_tanent.materials.dto.MaterialIndentResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MaterialIndentService {
    MaterialIndentResponse create(MaterialIndentRequest request, HttpServletRequest httpRequest);

    MaterialIndentResponse update(Long id, MaterialIndentRequest request, HttpServletRequest httpRequest);

    MaterialIndentResponse getById(Long id, HttpServletRequest httpRequest);

    Page<MaterialIndentResponse> getAll(Pageable pageable, HttpServletRequest httpRequest);

    void delete(Long id, HttpServletRequest httpRequest);

    MaterialIndentResponse updateStatus(Long id, MaterialIndentRequest request, HttpServletRequest httpRequest);

    MaterialIndentResponse updateApproval(Long id, com.example.multi_tanent.materials.dto.IndentApprovalRequest request,
            HttpServletRequest httpRequest);

    MaterialIndentResponse updatePoStatus(Long id, com.example.multi_tanent.materials.dto.PoStatusRequest request,
            HttpServletRequest httpRequest);
}
