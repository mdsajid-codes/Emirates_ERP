package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.dto.HangerTypeRequest;
import com.example.multi_tanent.hanger.dto.HangerTypeResponse;
import com.example.multi_tanent.hanger.enums.HangerTypeEnum;
import com.example.multi_tanent.hanger.service.HangerTypeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HangerTypeController.class)
@AutoConfigureMockMvc(addFilters = false) // Disabling filters to focus on controller logic and skip module guard for
                                          // unit test
class HangerTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HangerTypeService hangerTypeService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void getAll_ShouldReturnList() throws Exception {
        HangerTypeResponse response = new HangerTypeResponse();
        response.setTypeName(HangerTypeEnum.ADULT);

        when(hangerTypeService.getAllActive()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/hanger/types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].typeName").value("ADULT"));
    }

    @Test
    @WithMockUser
    void create_ShouldReturnCreated() throws Exception {
        HangerTypeRequest request = new HangerTypeRequest();
        request.setTypeName(HangerTypeEnum.ADULT);
        request.setUnitWeightGrams(new BigDecimal("50.0"));
        request.setStandardWidthCm(new BigDecimal("42.0"));
        request.setStandardHookCm(new BigDecimal("4.5"));

        HangerTypeResponse response = new HangerTypeResponse();
        response.setId(1L);
        response.setTypeName(HangerTypeEnum.ADULT);

        when(hangerTypeService.create(any(HangerTypeRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/hanger/types")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.typeName").value("ADULT"));
    }
}
