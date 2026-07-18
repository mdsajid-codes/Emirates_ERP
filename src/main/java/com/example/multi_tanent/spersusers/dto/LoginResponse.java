package com.example.multi_tanent.spersusers.dto;

import java.util.List;
import com.example.multi_tanent.master.entity.ServiceModule;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private List<String> roles;
    private List<ServiceModule> modules;
    private ThemeResponse theme;
}
