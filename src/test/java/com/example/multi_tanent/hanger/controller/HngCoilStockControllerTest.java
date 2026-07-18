package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.dto.HngCoilStockResponse;
import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.service.HngCoilStockService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HngCoilStockController.class)
@AutoConfigureMockMvc(addFilters = false)
class HngCoilStockControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HngCoilStockService coilStockService;

    @Test
    @WithMockUser
    void getAll_ShouldReturnList() throws Exception {
        HngCoilStockResponse response = new HngCoilStockResponse();
        response.setCoilNo("COIL-101");

        when(coilStockService.getAll()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/hanger/coil-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].coilNo").value("COIL-101"));
    }

    @Test
    @WithMockUser
    void getTotalRemainingWeight_ShouldReturnMap() throws Exception {
        when(coilStockService.getTotalRemainingWeight()).thenReturn(new BigDecimal("5000.50"));

        mockMvc.perform(get("/api/hanger/coil-stock/total-remaining-weight"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRemainingWeightKg").value(5000.50));
    }

    @Test
    @WithMockUser
    void updateInspectionStatus_ShouldReturnUpdated() throws Exception {
        HngCoilStockResponse response = new HngCoilStockResponse();
        response.setInspectionStatus(CoilInspectionStatus.APPROVED);

        when(coilStockService.updateInspectionStatus(1L, CoilInspectionStatus.APPROVED, "Cool"))
                .thenReturn(response);

        mockMvc.perform(patch("/api/hanger/coil-stock/1/inspection")
                .param("status", "APPROVED")
                .param("remarks", "Cool"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inspectionStatus").value("APPROVED"));
    }
}
