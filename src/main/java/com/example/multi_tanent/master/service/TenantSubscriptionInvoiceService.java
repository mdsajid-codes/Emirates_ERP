package com.example.multi_tanent.master.service;

import com.example.multi_tanent.master.dto.TenantSubscriptionInvoiceRequest;
import com.example.multi_tanent.master.dto.TenantSubscriptionInvoiceResponse;
import com.example.multi_tanent.master.entity.PaymentStatus;
import com.example.multi_tanent.master.entity.TenantSubscriptionInvoice;

public interface TenantSubscriptionInvoiceService {
    TenantSubscriptionInvoiceResponse createInvoice(Long masterTenantId, TenantSubscriptionInvoiceRequest request);

    TenantSubscriptionInvoiceResponse updateStatus(Long id, PaymentStatus status);

    TenantSubscriptionInvoiceResponse getInvoice(Long id);

    TenantSubscriptionInvoice getInvoiceEntity(Long id);

    java.util.List<TenantSubscriptionInvoiceResponse> getAllInvoices(Long masterTenantId);
}
