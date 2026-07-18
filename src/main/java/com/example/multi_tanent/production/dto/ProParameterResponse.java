package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProParameter;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ProParameterResponse {
    private Long id;
    private String name;
    private boolean changesQuantity;
    private Long locationId;
    private String locationName;
    private List<ParameterValueResponse> values;

    @Data
    @Builder
    public static class ParameterValueResponse {
        private Long id;
        private String code;
        private String value;
    }

    public static ProParameterResponse fromEntity(ProParameter entity) {
        return ProParameterResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .changesQuantity(entity.isChangesQuantity())
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                .values(entity.getValues().stream()
                        .map(val -> ParameterValueResponse.builder().id(val.getId()).code(val.getCode()).value(val.getValue()).build())
                        .collect(Collectors.toList()))
                .build();
    }
}