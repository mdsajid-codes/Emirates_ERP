package com.example.multi_tanent.accounts.service;

import com.example.multi_tanent.accounts.dto.payment.AccPdcBounceRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPdcClearRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPdcResponse;

import java.util.List;

public interface AccPdcService {
    AccPdcResponse clearPdc(Long id, AccPdcClearRequest request, String tenantId);
    AccPdcResponse bouncePdc(Long id, AccPdcBounceRequest request, String tenantId);
    AccPdcResponse getPdc(Long id, String tenantId);
    List<AccPdcResponse> getAllPdcs(String tenantId);
}
