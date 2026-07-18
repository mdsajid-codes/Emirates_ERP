package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.entity.HngCoilStock;
import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.enums.CoilStatus;
import com.example.multi_tanent.hanger.repository.HngCoilStockRepository;
import com.example.multi_tanent.purchases.entity.PurGrn;
import com.example.multi_tanent.purchases.entity.PurGrnItem;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class HngCoilStockCreationService {

    private final HngCoilStockRepository coilStockRepo;
    private final HngCoilNumberGenerator coilNumberGenerator;

    /**
     * Creates HngCoilStock records for all items in the GRN flagged as coils.
     * This is called by PurGrnService after saving a GRN.
     */
    @Transactional("tenantTx")
    public void createFromGrn(PurGrn grn, Tenant tenant) {
        if (grn.getItems() == null || grn.getItems().isEmpty()) {
            return;
        }

        List<HngCoilStock> newCoils = new ArrayList<>();

        for (PurGrnItem item : grn.getItems()) {
            if (Boolean.TRUE.equals(item.getIsHangerCoil())) {
                log.info("Registering coil from GRN Item ID: {}, Coil No: {}", item.getId(), item.getCoilNo());

                HngCoilStock coil = HngCoilStock.builder()
                        .tenant(tenant)
                        .coilNo(item.getCoilNo())
                        .grnItemId(item.getId())
                        .heatNo(item.getHeatNo())
                        .lotNo(item.getLotNo())
                        .materialType(item.getMaterialType())
                        .wireGaugeMm(item.getWireGaugeMm())
                        .totalWeightKg(item.getNetWeightKg())
                        .remainingWeightKg(item.getNetWeightKg())
                        .ratePerKg(item.getRatePerKg())
                        .warehouseLocation(item.getWarehouseLocation())
                        .millCertificateUrl(item.getMillCertificateUrl())
                        .receivedDate(grn.getGrnDate())
                        .inspectionStatus(CoilInspectionStatus.PENDING)
                        .status(CoilStatus.AVAILABLE)
                        .supplierName(grn.getPurchaseOrder() != null && grn.getPurchaseOrder().getSupplier() != null
                                ? grn.getPurchaseOrder().getSupplier().getCompanyName()
                                : null)
                        .build();

                newCoils.add(coil);
            }
        }

        if (!newCoils.isEmpty()) {
            coilStockRepo.saveAll(newCoils);
            log.info("Successfully registered {} coils for tenant: {}", newCoils.size(), tenant.getName());
        }
    }
}
