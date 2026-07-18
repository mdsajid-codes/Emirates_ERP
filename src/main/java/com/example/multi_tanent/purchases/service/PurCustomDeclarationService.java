package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.purchases.dto.PurCustomDeclarationRequest;
import com.example.multi_tanent.purchases.dto.PurCustomDeclarationResponse;

import java.util.List;

public interface PurCustomDeclarationService {
    PurCustomDeclarationResponse create(PurCustomDeclarationRequest request);
    PurCustomDeclarationResponse update(Long id, PurCustomDeclarationRequest request);
    PurCustomDeclarationResponse getById(Long id);
    List<PurCustomDeclarationResponse> getAll();
    void delete(Long id);
    PurCustomDeclarationResponse generateFromInvoices(List<Long> invoiceIds);
}
