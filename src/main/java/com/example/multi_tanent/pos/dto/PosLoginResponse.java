package com.example.multi_tanent.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PosLoginResponse {
    private String token;
    private List<String> roles;
    private String username;
    private String displayName;
    private Long storeId;
}