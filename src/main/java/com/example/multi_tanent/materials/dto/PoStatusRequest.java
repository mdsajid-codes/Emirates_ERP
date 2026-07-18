package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.enums.CreatePoStatus;
import lombok.Data;

@Data
public class PoStatusRequest {
    private CreatePoStatus createPoStatus;
}
