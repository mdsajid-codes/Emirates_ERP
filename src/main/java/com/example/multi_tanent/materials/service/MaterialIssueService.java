package com.example.multi_tanent.materials.service;

import com.example.multi_tanent.materials.dto.MaterialIssueRequest;
import com.example.multi_tanent.materials.dto.MaterialIssueResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MaterialIssueService {
    MaterialIssueResponse create(MaterialIssueRequest request, HttpServletRequest httpRequest);

    MaterialIssueResponse update(Long id, MaterialIssueRequest request, HttpServletRequest httpRequest);

    MaterialIssueResponse getById(Long id, HttpServletRequest httpRequest);

    Page<MaterialIssueResponse> getAll(Pageable pageable, HttpServletRequest httpRequest);

    void delete(Long id, HttpServletRequest httpRequest);
}
