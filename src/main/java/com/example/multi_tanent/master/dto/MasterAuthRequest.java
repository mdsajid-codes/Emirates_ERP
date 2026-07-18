package com.example.multi_tanent.master.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MasterAuthRequest {
    private String username;
    private String password;
}
