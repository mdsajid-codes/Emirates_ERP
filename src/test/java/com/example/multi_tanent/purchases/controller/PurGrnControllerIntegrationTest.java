package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurGrnRequest;
import com.example.multi_tanent.purchases.dto.PurGrnResponse;
import com.example.multi_tanent.purchases.service.PurGrnService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PurGrnController.class)
class PurGrnControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PurGrnService grnService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void createGrn_Success() throws Exception {
        PurGrnRequest request = PurGrnRequest.builder()
                .purchaseOrderId(1L)
                .grnNumber("GRN-101")
                .grnDate(LocalDate.now())
                .items(new ArrayList<>())
                .build();

        when(grnService.create(any(PurGrnRequest.class))).thenReturn(new PurGrnResponse());

        mockMvc.perform(post("/api/purchases/grns")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser
    void getPing_Success() throws Exception {
        mockMvc.perform(get("/api/purchases/grns/ping"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void getById_Success() throws Exception {
        when(grnService.getById(1L)).thenReturn(new PurGrnResponse());

        mockMvc.perform(get("/api/purchases/grns/1"))
                .andExpect(status().isOk());
    }

    /**
     * This test demonstrates that without the \\d+ regex,
     * a GET to a path like /api/purchases/grns/something
     * would be matched by @GetMapping("/{id}").
     * With the regex, it should return 404 if "something" is not a number.
     */
    @Test
    @WithMockUser
    void getById_NonNumericId_Returns404() throws Exception {
        mockMvc.perform(get("/api/purchases/grns/abc"))
                .andExpect(status().isNotFound());
    }
}
