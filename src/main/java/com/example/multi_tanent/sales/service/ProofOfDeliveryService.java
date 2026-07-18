package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.sales.dto.PodRequest;
import com.example.multi_tanent.sales.dto.PodResponse;
import com.example.multi_tanent.sales.entity.DeliveryOrder;
import com.example.multi_tanent.sales.entity.ProofOfDelivery;
import com.example.multi_tanent.sales.enums.PodStatus;
import com.example.multi_tanent.sales.enums.SalesStatus;
import com.example.multi_tanent.sales.repository.DeliveryOrderRepository;
import com.example.multi_tanent.sales.repository.ProofOfDeliveryRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.service.WareStorageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ProofOfDeliveryService {

    private final ProofOfDeliveryRepository podRepository;
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final WareStorageService storageService;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found in current DB"));
    }

    @Transactional
    public PodResponse submitPod(Long doId, PodRequest req, MultipartFile signature, MultipartFile photo) {
        Tenant tenant = getCurrentTenant();
        DeliveryOrder doOrder = deliveryOrderRepository.findByIdAndTenantId(doId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Delivery Order not found with ID: " + doId));

        // Validate status
        if (doOrder.getStatus() != SalesStatus.DISPATCHED && doOrder.getStatus() != SalesStatus.OUT_FOR_DELIVERY) {
            throw new IllegalArgumentException("Cannot submit POD for order in status: " + doOrder.getStatus());
        }

        // Check duplicate
        podRepository.findByDeliveryOrderIdAndEnterpriseId(doId, tenant.getId()).ifPresent(p -> {
            throw new IllegalArgumentException("POD already submitted for Delivery Order ID: " + doId);
        });

        PodStatus status = PodStatus.valueOf(req.getStatus().toUpperCase());

        String signatureUrl = null;
        String photoUrl = null;
        try {
            if (signature != null && !signature.isEmpty()) {
                signatureUrl = storageService.storePodSignature(signature, String.valueOf(tenant.getId()));
            }
            if (photo != null && !photo.isEmpty()) {
                photoUrl = storageService.storePodPhoto(photo, String.valueOf(tenant.getId()));
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store POD files", e);
        }

        ProofOfDelivery pod = ProofOfDelivery.builder()
                .deliveryOrder(doOrder)
                .status(status)
                .signatureUrl(signatureUrl)
                .photoUrl(photoUrl)
                .receivedByName(req.getReceivedByName())
                .receivedByPhone(req.getReceivedByPhone())
                .gpsLatitude(req.getGpsLatitude())
                .gpsLongitude(req.getGpsLongitude())
                .remarks(req.getRemarks())
                .rejectionReason(req.getRejectionReason())
                .enterprise(tenant)
                .deliveredAt(OffsetDateTime.now())
                .build();

        // Auto-triggers: Update Delivery Order Status on success/partial
        if (status == PodStatus.DELIVERED || status == PodStatus.PARTIAL) {
            doOrder.setStatus(SalesStatus.DELIVERED);
            doOrder.setDeliveredAt(pod.getDeliveredAt());
            deliveryOrderRepository.save(doOrder);
        }

        ProofOfDelivery saved = podRepository.save(pod);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PodResponse getPod(Long doId) {
        Tenant tenant = getCurrentTenant();
        ProofOfDelivery pod = podRepository.findByDeliveryOrderIdAndEnterpriseId(doId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("POD not found for Delivery Order ID: " + doId));
        return mapToResponse(pod);
    }

    @Transactional(readOnly = true)
    public Resource getPodSignatureImage(Long podId) {
        ProofOfDelivery pod = getPodEntity(podId);
        if (pod.getSignatureUrl() == null) throw new IllegalArgumentException("No signature available");
        return storageService.loadFileAsResource(pod.getSignatureUrl());
    }

    @Transactional(readOnly = true)
    public Resource getPodPhoto(Long podId) {
        ProofOfDelivery pod = getPodEntity(podId);
        if (pod.getPhotoUrl() == null) throw new IllegalArgumentException("No photo available");
        return storageService.loadFileAsResource(pod.getPhotoUrl());
    }

    private ProofOfDelivery getPodEntity(Long podId) {
        Tenant tenant = getCurrentTenant();
        return podRepository.findById(podId)
                .filter(p -> p.getEnterprise().getId().equals(tenant.getId()))
                .orElseThrow(() -> new EntityNotFoundException("POD not found with ID: " + podId));
    }

    private PodResponse mapToResponse(ProofOfDelivery pod) {
        return PodResponse.builder()
                .id(pod.getId())
                .deliveryOrderId(pod.getDeliveryOrder().getId())
                .deliveryOrderNumber(pod.getDeliveryOrder().getDeliveryOrderNumber())
                .status(pod.getStatus())
                .signatureUrl(pod.getSignatureUrl())
                .photoUrl(pod.getPhotoUrl())
                .receivedByName(pod.getReceivedByName())
                .receivedByPhone(pod.getReceivedByPhone())
                .gpsLatitude(pod.getGpsLatitude())
                .gpsLongitude(pod.getGpsLongitude())
                .remarks(pod.getRemarks())
                .rejectionReason(pod.getRejectionReason())
                .deliveredAt(pod.getDeliveredAt())
                .createdAt(pod.getCreatedAt())
                .build();
    }
}
