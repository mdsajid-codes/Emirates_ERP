package com.example.multi_tanent.production.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ProProcessRequest {

    @NotBlank(message = "Process name is required.")
    private String name;

    private Long locationId;

    @Valid
    private List<ProProcessWorkGroupRequest> workGroups;

    @Data
    public static class ProProcessWorkGroupRequest {
        @NotNull(message = "Work group ID is required.")
        private Long workGroupId;
        @NotNull @Min(1) private Integer sequenceIndex;
    }
}