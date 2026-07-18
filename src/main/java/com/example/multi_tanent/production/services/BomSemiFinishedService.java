package com.example.multi_tanent.production.services;

import com.example.multi_tanent.production.dto.BomSemiFinishedRequest;
import com.example.multi_tanent.production.dto.BomSemiFinishedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BomSemiFinishedService {
    BomSemiFinishedResponse create(BomSemiFinishedRequest request);

    BomSemiFinishedResponse update(Long id, BomSemiFinishedRequest request);

    BomSemiFinishedResponse getById(Long id);

    Page<BomSemiFinishedResponse> getAll(Pageable pageable);

    void delete(Long id);
}
