package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.service.TenantModuleChecker;
import com.example.multi_tanent.purchases.dto.PurGrnItemRequest;
import com.example.multi_tanent.purchases.dto.PurGrnRequest;
import com.example.multi_tanent.purchases.dto.PurGrnResponse;
import com.example.multi_tanent.purchases.entity.PurGrn;
import com.example.multi_tanent.purchases.entity.PurPurchaseOrder;
import com.example.multi_tanent.purchases.entity.PurPurchaseOrderItem;
import com.example.multi_tanent.purchases.repository.PurGrnItemRepository;
import com.example.multi_tanent.purchases.repository.PurGrnRepository;
import com.example.multi_tanent.purchases.repository.PurPurchaseOrderRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurGrnServiceTest {

    @Mock
    private PurGrnRepository grnRepo;
    @Mock
    private PurGrnItemRepository grnItemRepo;
    @Mock
    private PurPurchaseOrderRepository poRepo;
    @Mock
    private TenantRepository tenantRepo;
    @Mock
    private TenantModuleChecker tenantModuleChecker;

    @InjectMocks
    private PurGrnService grnService;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId("test-tenant");
    }

    @Test
    void createGrn_Success() {
        // Arrange
        Long poId = 1L;
        Long poItemId = 1L;

        PurGrnRequest request = PurGrnRequest.builder()
                .purchaseOrderId(poId)
                .grnNumber("GRN-101")
                .grnDate(LocalDate.now())
                .items(new ArrayList<>())
                .build();

        PurGrnItemRequest itemRequest = PurGrnItemRequest.builder()
                .purchaseOrderItemId(poItemId)
                .receivedQuantity(new BigDecimal("10"))
                .rate(new BigDecimal("100"))
                .build();
        request.getItems().add(itemRequest);

        PurPurchaseOrder po = new PurPurchaseOrder();
        po.setId(poId);

        PurPurchaseOrderItem poItem = new PurPurchaseOrderItem();
        poItem.setId(poItemId);
        poItem.setQuantity(new BigDecimal("20"));
        poItem.setReceivedQuantity(BigDecimal.ZERO);

        List<PurPurchaseOrderItem> poItems = new ArrayList<>();
        poItems.add(poItem);
        po.setItems(poItems);

        Tenant tenant = new Tenant();
        tenant.setId(1L);

        when(poRepo.findByIdWithItemsForUpdate(poId)).thenReturn(Optional.of(po));
        when(tenantRepo.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(grnRepo.save(any(PurGrn.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        PurGrnResponse response = grnService.create(request);

        // Assert
        assertNotNull(response);
        verify(grnRepo, times(1)).save(any(PurGrn.class));
    }

    @Test
    void createGrn_PoNotFound_ThrowsException() {
        // Arrange
        PurGrnRequest request = PurGrnRequest.builder()
                .purchaseOrderId(1L)
                .build();

        when(poRepo.findByIdWithItemsForUpdate(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> grnService.create(request));
    }
}
